import { z } from "zod";
import { evalService } from "@/lib/engine/tree/evalService";
import { ghostEngine } from "@/lib/engine/ghost/ghostEngine";
import { fail, ok, readJson } from "@/lib/engine/_shared/apiHelpers";
import { getOrCreateDemoSession, getSession } from "@/lib/engine/_shared/sessionStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  dealId: z.string().min(1),
  nodeId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const { dealId, nodeId } = await readJson(req, BodySchema);
    const session = dealId === "demo" ? getOrCreateDemoSession() : getSession(dealId);
    const ghost = await ghostEngine.generate(session);
    const score = await evalService.scorePosition(session, ghost, nodeId);
    return ok({ score });
  } catch (e) {
    return fail(e);
  }
}
