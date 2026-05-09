/**
 * POST /api/translate
 * Body: { scenarioId: ScenarioId, target: "fr" | "en" }
 *
 * Returns the hardcoded paragraph-aligned translation for the scenario.
 */

import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { getScenario } from "@/lib/scenarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  scenarioId: z.enum(["dunder", "nimbus"]),
  target: z.enum(["fr", "en"]),
});

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail("bad_json", "Request body must be JSON.", 400);
  }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return fail("bad_input", "Need {scenarioId,target}.", 400);

  const s = getScenario(parsed.data.scenarioId);
  const paragraphs =
    parsed.data.target === "fr" ? s.paragraphs.map((p) => p.fr) : s.paragraphs.map((p) => p.en);
  return ok({ paragraphs, mode: "hardcoded" });
}
