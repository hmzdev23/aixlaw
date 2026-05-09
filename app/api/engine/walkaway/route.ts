import { ghostEngine } from "@/lib/engine/ghost/ghostEngine";
import { walkawayService } from "@/lib/engine/tree/walkawayService";
import { fail, ok, requireSearchParam } from "@/lib/engine/_shared/apiHelpers";
import { getOrCreateDemoSession, getSession } from "@/lib/engine/_shared/sessionStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const dealId = requireSearchParam(req, "dealId");
    const session = dealId === "demo" ? getOrCreateDemoSession() : getSession(dealId);
    const ghost = await ghostEngine.generate(session);
    const line = await walkawayService.getLine(session, ghost);
    return ok(line);
  } catch (e) {
    return fail(e);
  }
}
