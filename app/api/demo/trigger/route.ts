/**
 * POST /api/demo/trigger
 * Body: { documentFocus?: "nda" | "msa" }
 *
 * Returns: { ok: true, data: { event: InboundEvent, session: DealSession } }
 *
 * Always works — even with no Google creds and no internet — because the
 * service falls back to fixture paths under "Example Scenario (Optional)/".
 *
 * This is the path the demo uses on stage. Don't break it.
 */

import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { getInboundService } from "@/lib/integrations/inbound/factory";
import { logger } from "@/lib/util/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z
  .object({
    documentFocus: z.enum(["nda", "msa"]).optional(),
  })
  .strict();

export async function POST(req: Request): Promise<Response> {
  let body: unknown = {};
  try {
    const text = await req.text();
    body = text.length > 0 ? JSON.parse(text) : {};
  } catch {
    return fail("bad_json", "Request body is not valid JSON.", 400);
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return fail("bad_input", parsed.error.issues[0]?.message ?? "Invalid input.", 400);
  }

  try {
    const inbound = await getInboundService();
    const event = await inbound.triggerManualDemo({
      documentFocus: parsed.data.documentFocus,
    });
    const session = inbound.toDealSession(event);
    return ok({ event, session });
  } catch (err) {
    logger.error("demo trigger failed", { err: (err as Error).message });
    return fail("internal", "Could not trigger demo.", 500);
  }
}
