import { z } from "zod";
import { fail, ok, readJson } from "@/lib/engine/_shared/apiHelpers";
import { architectRuntime } from "@/lib/engine/architect/runtime";
import { playbookRepository } from "@/lib/engine/architect/repository";
import {
  getOrCreateDemoSession,
  getSession,
} from "@/lib/engine/_shared/sessionStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  dealId: z.string().min(1),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { dealId } = await readJson(req, BodySchema);
    const session = dealId === "demo" ? getOrCreateDemoSession() : getSession(dealId);
    const playbook = await playbookRepository.get(id);
    const decision = await architectRuntime.execute(playbook, session);
    return ok(decision);
  } catch (e) {
    return fail(e);
  }
}
