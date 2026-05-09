/**
 * POST /api/agents/decide
 * Body: { goal, lastTurns: DebateTurn[], parentLabel?: string }
 *
 * Returns 3 mutually-exclusive options the user can pick to move the deal
 * forward, each with a delta (-3..+3) on the win bar.
 */

import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { complete, hasLLM } from "@/lib/anthropic";
import type { DecisionOption } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  goal: z.string().min(5),
  lastTurns: z
    .array(z.object({ agentId: z.string(), text: z.string(), delta: z.number() }))
    .default([]),
  parentLabel: z.string().optional(),
});

const FALLBACK: DecisionOption[] = [
  {
    id: "opt_accept_with_cap",
    label: "Counter: accept indemnity if liability is capped at 12 mo. fees",
    detail: "Trades a contained legal risk for the close. Likely to land.",
    delta: 2,
  },
  {
    id: "opt_walk_breach",
    label: "Hold the line on uncapped breach exposure",
    detail: "Lower close probability but protects the balance sheet.",
    delta: 1,
  },
  {
    id: "opt_concede",
    label: "Concede the ask (close fast)",
    detail: "Closes today; you're carrying long-tail risk.",
    delta: -2,
  },
];

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail("bad_json", "Request body must be JSON.", 400);
  }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return fail("bad_input", parsed.error.issues[0]?.message ?? "bad input", 400);

  if (!hasLLM()) return ok({ options: FALLBACK });

  const transcript = parsed.data.lastTurns
    .map((t) => `${t.agentId}: ${t.text}`)
    .join("\n");
  const sys = `You are the decision facilitator for a contract negotiation. Given the user's goal and the council debate, return EXACTLY 3 distinct options the user can take next. Each option has a delta from -3 (bad for goal) to +3 (great). Return ONLY a JSON array: [{"id":"opt_a","label":"...","detail":"...","delta":2},...]`;
  const user = `Goal: ${parsed.data.goal}\n\nDebate:\n${transcript}\n\nParent decision: ${parsed.data.parentLabel ?? "(root)"}`;

  const out = await complete({ system: sys, user, maxTokens: 600, temperature: 0.5 });
  const opts = parseOptions(out);
  return ok({ options: opts ?? FALLBACK });
}

function parseOptions(s: string): DecisionOption[] | null {
  if (!s) return null;
  const m = s.match(/\[[\s\S]*\]/);
  if (!m) return null;
  try {
    const v = JSON.parse(m[0]);
    if (!Array.isArray(v)) return null;
    return v
      .filter(
        (o) =>
          o &&
          typeof o.id === "string" &&
          typeof o.label === "string" &&
          typeof o.detail === "string" &&
          typeof o.delta === "number",
      )
      .slice(0, 3)
      .map((o) => ({
        id: o.id,
        label: o.label,
        detail: o.detail,
        delta: Math.max(-3, Math.min(3, Math.round(o.delta))),
      }));
  } catch {
    return null;
  }
}
