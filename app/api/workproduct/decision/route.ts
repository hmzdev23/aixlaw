/**
 * POST /api/workproduct/decision
 *
 * Body: Decision (validated by DecisionSchema).
 * Returns: { stored: true, duplicate: boolean, decision: Decision }
 *
 * Idempotency: same dealId + chosenMoveId returns the previously-stored
 * Decision without side-effects.
 */

import { fail, ok } from "@/lib/http";
import { DecisionSchema } from "@/lib/contracts/decisionSchema";
import { rememberDecision } from "@/lib/workproduct/decisionStore";
import { logger } from "@/lib/util/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    const text = await req.text();
    raw = text.length > 0 ? JSON.parse(text) : {};
  } catch {
    return fail("bad_json", "Request body is not valid JSON.", 400);
  }

  const parsed = DecisionSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(
      "bad_input",
      issue ? `${issue.path.join(".")}: ${issue.message}` : "Invalid Decision.",
      400,
    );
  }

  const { duplicate, stored } = rememberDecision(parsed.data);
  logger.info("workproduct: decision stored", {
    dealId: parsed.data.dealId,
    move: parsed.data.chosenMoveId,
    duplicate,
  });
  return ok({ stored: true, duplicate, decision: stored.decision });
}
