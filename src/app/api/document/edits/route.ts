/**
 * POST /api/document/edits
 * Body: { scenarioId, path: string[] }
 *
 * Walks the decision path and returns the cumulative list of edits to apply
 * to the contract paragraphs.
 */

import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { getScenario } from "@/lib/scenarios";
import type { ScenarioDecisionOption } from "@/lib/scenarios";
import type { DocumentEdit } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  scenarioId: z.enum(["dunder", "nimbus"]),
  path: z.array(z.string()).default([]),
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

  // Walk the path collecting every option's edits.
  const edits: DocumentEdit[] = [];
  let level: ScenarioDecisionOption[] = s.decisionRoot;
  for (const id of parsed.data.path) {
    const found = level.find((o) => o.id === id);
    if (!found) break;
    for (const e of found.edits ?? []) {
      const para = s.paragraphs.find((p) => p.id === e.paragraphId);
      if (!para) continue;
      edits.push({
        paragraphId: e.paragraphId,
        originalEn: para.en,
        replacementEn: e.replacement,
        originalFr: para.fr,
        replacementFr: e.replacementFr ?? e.replacement,
        optionId: found.id,
        optionLabel: found.label,
        sensitive: !!e.sensitive,
      });
    }
    level = found.children ?? [];
  }

  return ok({ edits, scenarioId: s.id, summaryTitle: s.summaryTitle });
}
