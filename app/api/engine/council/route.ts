import { z } from "zod";
import { NDJSON_HEADERS, asyncIterableToNdjson } from "@/lib/engine/_shared/ndjson";
import { fail, readJson } from "@/lib/engine/_shared/apiHelpers";
import { ghostEngine } from "@/lib/engine/ghost/ghostEngine";
import { councilService } from "@/lib/engine/council/councilService";
import { getLastCouncilResult } from "@/lib/engine/council/store";
import {
  getOrCreateDemoSession,
  getSession,
} from "@/lib/engine/_shared/sessionStore";
import type {
  CouncilResult,
  DealSession,
  DebateEvent,
  GhostProfile,
} from "@/contracts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/engine/council
 *
 * Body: { dealId: string, moveId: string }
 * Response: NDJSON stream of `DebateEvent`s, terminated by a final
 *           `{ kind: "result", result: CouncilResult }` line.
 */

const BodySchema = z.object({
  dealId: z.string().min(1),
  moveId: z.string().min(1),
});

type StreamLine =
  | DebateEvent
  | { kind: "result"; result: CouncilResult };

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = await readJson(req, BodySchema);
  } catch (e) {
    return fail(e);
  }
  const { dealId, moveId } = parsed;

  let session: DealSession;
  try {
    session = dealId === "demo" ? getOrCreateDemoSession() : getSession(dealId);
  } catch (e) {
    return fail(e);
  }

  let ghost: GhostProfile;
  try {
    ghost = await ghostEngine.generate(session);
  } catch (e) {
    return fail(e);
  }

  const sessionForStream = session;
  const ghostForStream = ghost;

  async function* combine(): AsyncIterable<StreamLine> {
    for await (const ev of councilService.deliberate(moveId, sessionForStream, ghostForStream)) {
      yield ev;
    }
    const result = getLastCouncilResult(dealId, moveId);
    if (result) yield { kind: "result", result };
  }

  return new Response(asyncIterableToNdjson(combine()), {
    status: 200,
    headers: NDJSON_HEADERS,
  });
}
