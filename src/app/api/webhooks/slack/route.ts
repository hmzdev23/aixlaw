/**
 * POST /api/webhooks/slack
 *
 * Handles Slack Events API callbacks:
 *   - URL verification handshake.
 *   - file_share message events (Initech procurement drops a redline).
 *
 * Acceptance criterion (07-will-inbound-auth.md):
 *   "Slack signature verification enforced (401 on bad sig)"
 *
 * Why we re-read the raw body: Slack signs the exact bytes, so we cannot rely
 * on `req.json()` which re-stringifies. We read text once, verify, then
 * JSON.parse it ourselves.
 */

import { fail, ok } from "@/lib/http";
import { verifySlackSignature } from "@/lib/integrations/slack/verify";
import { parseSlackPayload } from "@/lib/integrations/slack/handler";
import { getInboundService } from "@/lib/integrations/inbound/factory";
import { rememberInboundEvent } from "@/lib/integrations/inbound/store";
import { env } from "@/lib/util/env";
import { logger } from "@/lib/util/logger";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  let signingSecret: string;
  try {
    signingSecret = env.requireSlackSigningSecret();
  } catch {
    return fail(
      "slack_not_configured",
      "SLACK_SIGNING_SECRET is not set.",
      503,
    );
  }

  const rawBody = await req.text();

  const verdict = verifySlackSignature({
    rawBody,
    timestampHeader: req.headers.get("x-slack-request-timestamp"),
    signatureHeader: req.headers.get("x-slack-signature"),
    signingSecret,
  });
  if (!verdict.ok) {
    logger.warn("slack signature rejected", { reason: verdict.reason });
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return fail("bad_json", "Slack body is not valid JSON.", 400);
  }

  const parsed = parseSlackPayload(body);
  if (parsed.kind === "url_verification") {
    // Slack wants the raw challenge as a JSON body with `challenge` field, or
    // plain text. JSON works for both modern and legacy verifications.
    return NextResponse.json({ challenge: parsed.challenge });
  }
  if (parsed.kind === "file_share") {
    // Run through the InboundService for a uniform path (calendar context,
    // logging, store mutation).
    const inbound = await getInboundService();
    const event = await inbound.handleSlackPayload(body);
    if (event) rememberInboundEvent(event);
    return ok({ accepted: true, eventId: event?.id ?? null });
  }
  return ok({ accepted: false, reason: "ignored_event_type" });
}
