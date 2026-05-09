/**
 * GET /api/signoff/state?dealId=<id>
 *
 * Returns the current sign-off state for a deal. Defaults to `pending` when
 * no record exists (matches VoiceSignoffService.getState).
 */

import { fail, ok } from "@/lib/http";
import { getVoiceSignoffService } from "@/lib/voice/signoffService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const dealId = new URL(req.url).searchParams.get("dealId");
  if (!dealId) return fail("missing_dealId", "Provide ?dealId=...", 400);
  const state = await getVoiceSignoffService().getState(dealId);
  return ok({ state });
}
