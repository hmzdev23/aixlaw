/**
 * POST /api/agents/debate
 * Body: { scenarioId, workflow: agentId[], round: 0|1 }
 *
 * Returns one round of debate turns drawn from the scenario's per-agent
 * `debateRounds` array. Different round number returns different content.
 */

import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { getScenario } from "@/lib/scenarios";
import type { DebateTurn } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  scenarioId: z.enum(["dunder", "nimbus"]),
  workflow: z.array(z.enum(["pierre", "marie", "etienne", "sophie", "antoine"])).min(1),
  round: z.number().int().min(0).max(10).default(0),
});

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail("bad_json", "Request body must be JSON.", 400);
  }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return fail("bad_input", parsed.error.issues[0]?.message ?? "bad input", 400);

  const s = getScenario(parsed.data.scenarioId);
  const round = parsed.data.round;
  const turns: DebateTurn[] = [];
  const baseTs = Date.now();

  for (const agentId of parsed.data.workflow) {
    const agent = s.agents.find((a) => a.agentId === agentId);
    if (!agent) continue;
    const rounds = agent.debateRounds;
    const r = rounds[round % rounds.length] ?? [];
    r.forEach((t, i) => {
      turns.push({
        id: `t_${round}_${agentId}_${i}`,
        agentId,
        text: t.text,
        delta: t.delta,
        ts: new Date(baseTs + turns.length * 250).toISOString(),
        round,
      });
    });
  }

  return ok({ turns, round });
}
