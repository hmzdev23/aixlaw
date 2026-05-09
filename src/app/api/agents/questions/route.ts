/**
 * POST /api/agents/questions
 * Body: { agentId, goal, docExcerpt }
 * Returns 1-2 specific context questions for that agent.
 */

import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { complete, hasLLM } from "@/lib/anthropic";
import { getAgent } from "@/lib/agents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  agentId: z.string().min(1),
  goal: z.string().min(5),
  docExcerpt: z.string().max(6000).default(""),
});

const FALLBACK: Record<string, string[]> = {
  pierre: [
    "Which clauses are non-negotiable for legal? (e.g. governing law, IP)",
    "Has counsel pre-approved any standard fallback positions?",
  ],
  marie: [
    "Does the deal involve personal data of Quebec residents? If yes, summarise the data flow.",
    "Are there any known regulator notifications already pending for this counterparty?",
  ],
  etienne: [
    "What's the latest acceptable close date and the smallest acceptable contract value?",
    "Which leverage do we have? (replacement vendor, urgency, internal pressure, etc.)",
  ],
  sophie: [
    "What's the counterparty's headline pain (cost, risk, timeline)?",
    "Anything you've heard them push back on in past deals?",
  ],
  antoine: [
    "If you had to pick the single most important outcome, what is it?",
    "What's the absolute walk-away condition?",
  ],
};

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail("bad_json", "Request body must be JSON.", 400);
  }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return fail("bad_input", parsed.error.issues[0]?.message ?? "bad input", 400);

  const agent = getAgent(parsed.data.agentId);
  if (!agent) return fail("unknown_agent", "Unknown agent.", 404);

  const fallback = FALLBACK[agent.id] ?? [
    `What's the most important constraint ${agent.name} should know?`,
    "Anything else you want flagged before the debate starts?",
  ];

  if (!hasLLM()) {
    return ok({ questions: fallback });
  }

  const sys = `You are ${agent.name}, the ${agent.role} on a contract negotiation council. You specialise in ${agent.speciality}. The user just said their goal: "${parsed.data.goal}". Ask exactly 2 short, specific questions you need answered before you can debate well. Reply as a JSON array of strings, no preface, e.g. ["Q1","Q2"].`;
  const user = parsed.data.docExcerpt
    ? `Context excerpt:\n${parsed.data.docExcerpt.slice(0, 4000)}`
    : "(no excerpt provided)";
  const text = await complete({ system: sys, user, maxTokens: 300, temperature: 0.3 });
  const questions = parseJsonStringArray(text) ?? fallback;
  return ok({ questions: questions.slice(0, 2) });
}

function parseJsonStringArray(s: string): string[] | null {
  if (!s) return null;
  const m = s.match(/\[[\s\S]*\]/);
  if (!m) return null;
  try {
    const v = JSON.parse(m[0]);
    if (Array.isArray(v) && v.every((x) => typeof x === "string")) return v;
  } catch {
    /* ignore */
  }
  return null;
}
