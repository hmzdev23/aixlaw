/**
 * POST /api/outbound/gmail
 * Body: { dealId: string, subject: string, body: string, to?: string,
 *         attachDocx?: boolean }
 *
 * Creates a Gmail draft from the signed-in user's mailbox. When attachDocx
 * is true (default for demo flow), attaches the freshly-built counter-redline
 * docx for that deal.
 *
 * Why a draft (not a send): the demo arc has Sarah hit Send manually, and the
 * judges see the message land in her real Gmail drafts.
 */

import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { getDecision } from "@/lib/workproduct/decisionStore";
import { getWorkProductService } from "@/lib/workproduct/service";
import { getOutboundService } from "@/lib/integrations/outbound/service";
import { env } from "@/lib/util/env";
import { logger } from "@/lib/util/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z
  .object({
    dealId: z.string().min(1),
    subject: z.string().min(1),
    body: z.string().min(1),
    to: z.string().email().optional(),
    attachDocx: z.boolean().optional(),
  })
  .strict();

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = JSON.parse(await req.text());
  } catch {
    return fail("bad_json", "Request body is not valid JSON.", 400);
  }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return fail("bad_input", parsed.error.issues[0]?.message ?? "Invalid input.", 400);
  }
  const decision = getDecision(parsed.data.dealId);
  if (!decision) {
    return fail("not_found", `No Decision for dealId=${parsed.data.dealId}.`, 404);
  }

  try {
    const out = await getOutboundService();
    const attachment = parsed.data.attachDocx === false
      ? undefined
      : await buildAttachment(decision.dealId, decision.chosenMoveId);
    const result = await out.createGmailDraft({
      to: parsed.data.to ?? env.initechEmail(),
      subject: parsed.data.subject,
      body: parsed.data.body,
      attachment,
    });
    return ok({ draftId: result.draftId });
  } catch (err) {
    const e = err as Error & { name?: string };
    logger.error("gmail draft failed", { err: e.message, name: e.name });
    if (e.name === "GoogleNotAuthedError") {
      return fail(
        "google_not_authed",
        "Sign in via /api/auth/signin (or run with real Google OAuth — drafts cannot be created in demo mode).",
        401,
      );
    }
    return fail("internal", "Gmail draft creation failed.", 500);
  }
}

async function buildAttachment(dealId: string, moveId: string) {
  const decision = getDecision(dealId);
  if (!decision) return undefined;
  const bytes = await getWorkProductService().buildCounterRedlineDocx(decision);
  return {
    filename: `Dunder_counter_${moveId}_${dealId}.docx`,
    bytes,
  };
}
