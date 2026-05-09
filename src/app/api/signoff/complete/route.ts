/**
 * POST /api/signoff/complete
 * Body: { dealId: string, approved: boolean }
 *
 * Transitions playing -> signed (approved=true) or playing -> rejected.
 * Cockpit calls this after the <audio> element fires `ended` and the operator
 * confirms.
 */

import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { getVoiceSignoffService } from "@/lib/voice/signoffService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z
  .object({
    dealId: z.string().min(1),
    approved: z.boolean(),
  })
  .strict();

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return fail("bad_json", "Request body is not valid JSON.", 400);
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return fail("bad_input", "dealId and approved are required.", 400);
  }
  try {
    await getVoiceSignoffService().completeSignoff(
      parsed.data.dealId,
      parsed.data.approved,
    );
    const state = await getVoiceSignoffService().getState(parsed.data.dealId);
    return ok({ state });
  } catch (err) {
    const e = err as Error & { code?: string; status?: number };
    return fail(e.code ?? "internal", e.message, e.status ?? 500);
  }
}
