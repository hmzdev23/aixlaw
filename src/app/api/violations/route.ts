/**
 * POST /api/violations
 * Body: { scenarioId }
 * Returns the hardcoded list of potential law violations for the scenario.
 */

import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { getScenario } from "@/lib/scenarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ scenarioId: z.enum(["dunder", "nimbus"]) });

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail("bad_json", "Request body must be JSON.", 400);
  }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return fail("bad_input", "Need {scenarioId}.", 400);
  return ok({ violations: getScenario(parsed.data.scenarioId).lawViolations });
}
