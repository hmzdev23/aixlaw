import { z } from "zod";
import { ghostEngine } from "@/lib/engine/ghost/ghostEngine";
import { treeEngine } from "@/lib/engine/tree/treeEngine";
import { fail, ok, readJson } from "@/lib/engine/_shared/apiHelpers";
import { getOrCreateDemoSession, getSession } from "@/lib/engine/_shared/sessionStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  dealId: z.string().min(1),
  ghostVersion: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const { dealId } = await readJson(req, BodySchema);
    const session = dealId === "demo" ? getOrCreateDemoSession() : getSession(dealId);
    const ghost = await ghostEngine.generate(session);
    const tree = await treeEngine.bloom(session, ghost);
    return ok(tree);
  } catch (e) {
    return fail(e);
  }
}
