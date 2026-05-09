/**
 * POST /api/agents/decide
 * Body: { scenarioId, path: string[] }
 *
 * Returns the decision options at the end of the given path. `path` is the
 * sequence of decision option ids the user has chosen so far. Empty path =
 * root level.
 */

import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { getOptionsAt, getScenario } from "@/lib/scenarios";

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
  const { next } = getOptionsAt(s, parsed.data.path);
  return ok({
    options: next.map((o) => ({
      id: o.id,
      label: o.label,
      detail: o.detail,
      delta: o.delta,
      modifiesDoc: (o.edits?.length ?? 0) > 0,
      hasChildren: (o.children?.length ?? 0) > 0,
    })),
  });
}
