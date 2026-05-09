import { ghostEngine } from "@/lib/engine/ghost/ghostEngine";
import { treeEngine } from "@/lib/engine/tree/treeEngine";
import { fail, ok, requireSearchParam } from "@/lib/engine/_shared/apiHelpers";
import { getOrCreateDemoSession, getSession } from "@/lib/engine/_shared/sessionStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const dealId = requireSearchParam(req, "id");
    const nodeId = requireSearchParam(req, "nodeId");
    const session = dealId === "demo" ? getOrCreateDemoSession() : getSession(dealId);
    const ghost = await ghostEngine.generate(session);
    const text = await treeEngine.predictCounterMove(nodeId, session, ghost);
    return ok({ text });
  } catch (e) {
    return fail(e);
  }
}
