/**
 * POST /api/execution/fire
 * Body: { dealId: string }
 *
 * Loads the latest stored Decision for the deal, kicks off the 5-step pipeline
 * in the background, and returns immediately so the Cockpit can subscribe to
 * /api/execution/stream for live timeline events.
 *
 * Acceptance (docs/tasks/09): "Happy path shows 5 green checkmarks in order
 * within 10s test clock."
 */

import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { getDecision } from "@/lib/workproduct/decisionStore";
import { fireBackground } from "@/lib/execution/engine";
import { getTimelineSnapshot } from "@/lib/execution/timeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({ dealId: z.string().min(1) }).strict();

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return fail("bad_json", "Request body is not valid JSON.", 400);
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return fail("bad_input", "dealId is required.", 400);
  }
  const decision = getDecision(parsed.data.dealId);
  if (!decision) {
    return fail(
      "not_found",
      `No Decision stored for dealId=${parsed.data.dealId}. POST /api/workproduct/decision first.`,
      404,
    );
  }

  // Already firing? Return current snapshot rather than starting twice.
  const snap = getTimelineSnapshot(parsed.data.dealId);
  if (snap.events.length > 0 && !snap.complete) {
    return ok({
      already_firing: true,
      replay: snap.events,
    });
  }

  fireBackground(decision);
  return ok({ accepted: true, dealId: parsed.data.dealId });
}
