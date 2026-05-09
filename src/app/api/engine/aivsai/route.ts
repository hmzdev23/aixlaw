import { z } from "zod";
import {
  NDJSON_HEADERS,
  asyncIterableToNdjson,
} from "@/lib/engine/_shared/ndjson";
import { fail, readJson } from "@/lib/engine/_shared/apiHelpers";
import { aiVsAiService } from "@/lib/engine/council/aiVsAi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/engine/aivsai
 *
 * Body: { clauseText, leftGhostId, rightGhostId, maxRounds }
 * Response: NDJSON stream of `DebateEvent`s tagged `counterpart_left` /
 *           `counterpart_right`. Stream terminates when one side concedes or
 *           after `maxRounds` turns.
 */

const BodySchema = z.object({
  clauseText: z.string().min(10),
  leftGhostId: z.string().min(1),
  rightGhostId: z.string().min(1),
  maxRounds: z.number().int().min(1).max(12),
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = await readJson(req, BodySchema);
  } catch (e) {
    return fail(e);
  }

  return new Response(
    asyncIterableToNdjson(aiVsAiService.runClauseNegotiation(parsed)),
    { status: 200, headers: NDJSON_HEADERS }
  );
}
