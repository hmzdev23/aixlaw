/**
 * POST /api/agents/debate
 * Body: { goal, workflow: agentId[], context: {agentId,q,a}[], doc: string }
 * Returns a deterministic batch of debate turns (1-2 per agent).
 *
 * Uses Anthropic when available; otherwise builds canned but goal-aware lines.
 */

import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { complete, hasLLM } from "@/lib/anthropic";
import { AGENTS, getAgent } from "@/lib/agents";
import type { DebateTurn } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  goal: z.string().min(5),
  workflow: z.array(z.string()).min(1),
  context: z
    .array(z.object({ agentId: z.string(), question: z.string(), answer: z.string() }))
    .default([]),
  doc: z.string().max(20000).default(""),
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

  const { goal, workflow, context, doc } = parsed.data;
  const turns: DebateTurn[] = [];
  const now = Date.now();

  for (let round = 0; round < 2; round += 1) {
    for (const agentId of workflow) {
      const agent = getAgent(agentId);
      if (!agent) continue;
      const ctx = context
        .filter((c) => c.agentId === agentId)
        .map((c) => `Q: ${c.question}\nA: ${c.answer}`)
        .join("\n\n");

      let line: string | null = null;
      let delta = pickCannedDelta(agent.id, round);

      if (hasLLM()) {
        const sys = `You are ${agent.name}, the ${agent.role} on a contract negotiation council. You specialise in ${agent.speciality}. Reply in ONE short paragraph (max 60 words) arguing your position toward the user's goal: "${goal}". Reply ONLY with JSON: {"text":"...","delta":-3..3} where delta is +3 (helps user goal a lot) to -3 (hurts goal a lot).`;
        const user = `Round ${round + 1}.\n\nUser context for you:\n${ctx || "(none)"}\n\nContract excerpt (truncated):\n${doc.slice(0, 5000)}`;
        const out = await complete({ system: sys, user, maxTokens: 250, temperature: 0.5 });
        const parsedOut = parseTurnJson(out);
        if (parsedOut) {
          line = parsedOut.text;
          delta = parsedOut.delta;
        }
      }

      if (!line) {
        line = cannedLine(agent.id, goal, round);
      }

      turns.push({
        id: `turn_${turns.length + 1}`,
        agentId: agent.id,
        text: line,
        delta: clampDelta(delta),
        ts: new Date(now + turns.length * 500).toISOString(),
      });
    }
  }

  return ok({ turns });
}

function pickCannedDelta(agentId: string, round: number): number {
  const map: Record<string, number[]> = {
    pierre: [-2, +1],
    marie: [-1, 0],
    etienne: [+2, +1],
    sophie: [-2, -1],
    antoine: [+1, +2],
  };
  return map[agentId]?.[round] ?? 0;
}

function cannedLine(agentId: string, goal: string, round: number): string {
  const goalSnip = goal.slice(0, 60);
  const lines: Record<string, string[]> = {
    pierre: [
      `Counsel: the indemnity language as drafted exposes us — that directly fights "${goalSnip}".`,
      `On reflection, narrowing the carve-out to data breach only would protect the deal economics.`,
    ],
    marie: [
      `Compliance: there's personal information in scope, so Law 25 disclosures apply. We can comply, but it adds two clauses.`,
      `If we agree to host in QC, we de-risk the regulator path completely.`,
    ],
    etienne: [
      `Closer: your goal is to close — let's accept the audit clause if they drop convenience termination.`,
      `Frankly we have leverage on price; trade dollars for risk and we hit "${goalSnip}" this quarter.`,
    ],
    sophie: [
      `Counterparty (steelman): if they don't get uncapped breach liability, their procurement won't sign.`,
      `They will likely fold on payment terms before they fold on liability — plan accordingly.`,
    ],
    antoine: [
      `Crown: tying it together — we trade IP-on-custom-work for a real liability cap.`,
      `Recommendation aligns with your goal "${goalSnip}" and keeps us out of the regulator's path.`,
    ],
  };
  return lines[agentId]?.[round] ?? `${agentId}: weighing the room's points against your goal.`;
}

function parseTurnJson(s: string): { text: string; delta: number } | null {
  if (!s) return null;
  const m = s.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const v = JSON.parse(m[0]) as { text?: unknown; delta?: unknown };
    if (typeof v.text !== "string") return null;
    const d = typeof v.delta === "number" ? v.delta : 0;
    return { text: v.text.trim(), delta: d };
  } catch {
    return null;
  }
}

function clampDelta(n: number): number {
  return Math.max(-3, Math.min(3, Math.round(n)));
}

// Agents map convenience for unused but explicit reference
export const _DEBATE_KEYS = AGENTS.map((a) => a.id);
