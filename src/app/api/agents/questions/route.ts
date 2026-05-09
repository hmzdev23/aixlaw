/**
 * POST /api/agents/questions
 * Body: { scenarioId, agentId }
 *
 * Returns the hardcoded questions + side-panel hint for the agent.
 */

import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { getScenario } from "@/lib/scenarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  scenarioId: z.enum(["dunder", "nimbus"]),
  agentId: z.enum(["pierre", "marie", "etienne", "sophie", "antoine"]),
});

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail("bad_json", "Request body must be JSON.", 400);
  }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return fail("bad_input", "Need {scenarioId, agentId}.", 400);

  const s = getScenario(parsed.data.scenarioId);
  const a = s.agents.find((x) => x.agentId === parsed.data.agentId);
  if (!a) return fail("unknown_agent", "Agent not in this scenario.", 404);

  return ok({ questions: a.questions, hint: a.hint });
}
