/**
 * POST /api/outbound/slack
 * Body: { dealId: string, title: string, body: string, locale?: "en"|"fr" }
 *
 * Posts a deal-update message to the configured Slack incoming webhook. Used
 * by T9 execution for the "counter sent" / "deal closed" notifications and
 * available stand-alone for demo manual triggers.
 */

import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { getOutboundService } from "@/lib/integrations/outbound/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z
  .object({
    dealId: z.string().min(1),
    title: z.string().min(1),
    body: z.string().min(1),
    locale: z.enum(["en", "fr"]).optional(),
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
  const out = await getOutboundService();
  await out.slackDealUpdate({
    dealId: parsed.data.dealId,
    title: parsed.data.title,
    body: parsed.data.body,
    locale: parsed.data.locale ?? "en",
  });
  return ok({ accepted: true });
}
