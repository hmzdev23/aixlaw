import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import type {
  CouncilResult,
  CouncilService,
  DealSession,
  DebateEvent,
  GhostProfile,
  VoteValue,
} from "@/contracts";
import { jsonChat } from "../_shared/anthropic";
import { TtlCache } from "../_shared/cache";
import { env } from "../_shared/env";
import { EngineError } from "../_shared/errors";
import { repoRoot } from "../_shared/paths";
import { complianceService } from "../compliance";
import { treeEngine } from "../tree/treeEngine";
import {
  CROWN_SYSTEM_PROMPT,
  COUNCIL_VOTES_SYSTEM_PROMPT,
  type CouncilVotesPayload,
  type CrownPayload,
  councilVotesUserPrompt,
  crownUserPrompt,
} from "./agents";
import { rememberCouncilResult } from "./store";

/**
 * CouncilService.deliberate streams DebateEvents for one candidate move.
 *
 * Pipeline:
 *   1. Resolve the chosen move from the cached GameTree.
 *   2. Get the ComplianceReport (stub today; real T6 once wired).
 *   3. Single Claude call returning all 4 agent votes (parallel-ish, fewer roundtrips).
 *   4. Second Claude call: Crown synthesis with the votes as input.
 *   5. Map to DebateEvents with timed offsets so the UI can animate.
 *   6. Persist the CouncilResult for the audit badge.
 *
 * Falls back to canned timeline (`council_canned.json`) when LLM is disabled
 * or any step throws.
 */

const VoteSchema = z.enum([
  "accept",
  "reject",
  "likely_counter_accept",
  "clear",
  "abstain",
]) satisfies z.ZodType<VoteValue>;

const VotesSchema: z.ZodType<CouncilVotesPayload> = z.object({
  counsel:     z.object({ message: z.string().min(3).max(280), vote: VoteSchema, influenceDelta: z.number().min(0).max(0.5) }),
  closer:      z.object({ message: z.string().min(3).max(280), vote: VoteSchema, influenceDelta: z.number().min(0).max(0.5) }),
  counterpart: z.object({ message: z.string().min(3).max(280), vote: VoteSchema, influenceDelta: z.number().min(0).max(0.5) }),
  compliance:  z.object({ message: z.string().min(3).max(280), vote: VoteSchema, influenceDelta: z.number().min(0).max(0.5) }),
});

const CrownSchema: z.ZodType<CrownPayload> = z.object({
  message: z.string().min(3).max(280),
  vote: VoteSchema,
});

const CANNED_PATH = path.join(repoRoot(), "src/lib/fixtures/council_canned.json");
const cache = new TtlCache<string, DebateEvent[]>(30 * 60 * 1000);

interface CannedTimeline {
  events: DebateEvent[];
}

interface CannedFile {
  [moveId: string]: CannedTimeline;
}

let cannedCache: CannedFile | undefined;
async function loadCannedFile(): Promise<CannedFile> {
  if (cannedCache) return cannedCache;
  let raw: string;
  try {
    raw = await fs.readFile(CANNED_PATH, "utf8");
  } catch (e) {
    throw new EngineError({
      code: "fixture_missing",
      message: "council_canned.json missing",
      cause: e,
    });
  }
  cannedCache = JSON.parse(raw) as CannedFile;
  return cannedCache;
}

export async function loadCannedDebate(moveId: string): Promise<DebateEvent[]> {
  const file = await loadCannedFile();
  const hit = file[moveId];
  if (hit) return hit.events;
  // For unknown move ids, synthesize a generic 5-event sequence so the demo
  // never produces an empty stream.
  return file["n_a_brilliant"].events;
}

class CouncilServiceImpl implements CouncilService {
  async *deliberate(
    moveId: string,
    session: DealSession,
    ghost: GhostProfile
  ): AsyncIterable<DebateEvent> {
    if (!moveId) {
      throw new EngineError({ code: "bad_request", message: "moveId is required" });
    }

    const cacheKey = `${session.dealId}::${moveId}::${session.locale}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      for (const ev of cached) yield ev;
      const result = synthesizeResultFromEvents(moveId, cached);
      rememberCouncilResult(session.dealId, result);
      return;
    }

    let events: DebateEvent[];

    if (env.llmDisabled) {
      events = await loadCannedDebate(moveId);
    } else {
      try {
        events = await runLiveCouncil(moveId, session, ghost);
      } catch (e) {
        if (env.debug) console.warn("[council] LLM failed, using canned:", e);
        events = await loadCannedDebate(moveId);
      }
    }

    cache.set(cacheKey, events);
    for (const ev of events) yield ev;

    const result = synthesizeResultFromEvents(moveId, events);
    rememberCouncilResult(session.dealId, result);
  }
}

async function runLiveCouncil(
  moveId: string,
  session: DealSession,
  ghost: GhostProfile
): Promise<DebateEvent[]> {
  // Pull the move out of the cached tree so prompts have move context.
  const tree = await treeEngine.bloom(session, ghost);
  const node = tree.nodes[moveId];
  if (!node?.move) {
    throw new EngineError({
      code: "not_found",
      message: `Tree node not found or has no move: ${moveId}`,
    });
  }

  // Compliance report (stub today, T6 swaps in real impl).
  const compliance = await complianceService().checkProposedText(
    `${node.move.label}\n${node.move.summary}`,
    session.locale
  );
  const complianceSummary = [
    `OSFI:    triggered=${compliance.osfi.triggered} (${compliance.osfi.triggers.length} themes)`,
    `PIPEDA:  triggered=${compliance.pipeda.triggered} (${compliance.pipeda.triggers.length} themes)`,
    `Law 25:  triggered=${compliance.law25.triggered}`,
    `TrueSight: ${compliance.trueSight.status}`,
  ].join("\n");

  // 1) Four agent votes in one call.
  const votes = await jsonChat(VotesSchema, {
    system: COUNCIL_VOTES_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: councilVotesUserPrompt({
          ghost,
          moveLabel: node.move.label,
          moveSummary: node.move.summary,
          moveNotation: node.move.notation,
          evalScore: tree.evalScore,
          complianceSummary,
        }),
      },
    ],
    maxTokens: 1200,
  });

  // 2) Crown synthesis with the votes as context.
  const crown = await jsonChat(CrownSchema, {
    system: CROWN_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: crownUserPrompt({
          moveLabel: node.move.label,
          moveNotation: node.move.notation,
          votes,
        }),
      },
    ],
    maxTokens: 300,
  });

  return [
    { t:    0, agent: "counsel",     message: votes.counsel.message,     vote: votes.counsel.vote,     influenceDelta: votes.counsel.influenceDelta },
    { t:  220, agent: "closer",      message: votes.closer.message,      vote: votes.closer.vote,      influenceDelta: votes.closer.influenceDelta },
    { t:  440, agent: "counterpart", message: votes.counterpart.message, vote: votes.counterpart.vote, influenceDelta: votes.counterpart.influenceDelta },
    { t:  660, agent: "compliance",  message: votes.compliance.message,  vote: votes.compliance.vote,  influenceDelta: votes.compliance.influenceDelta },
    { t:  900, agent: "crown",       message: crown.message,             vote: crown.vote,             influenceDelta: 0.3 },
  ];
}

function synthesizeResultFromEvents(
  moveId: string,
  events: DebateEvent[]
): CouncilResult {
  const tally: Partial<Record<DebateEvent["agent"], VoteValue>> = {};
  let crownMessage = "Following Council: recommendation pending.";
  for (const ev of events) {
    if (ev.agent === "crown" && ev.message) crownMessage = ev.message;
    if (ev.vote) tally[ev.agent] = ev.vote;
  }
  // Strip non-CouncilRole agents (AI-vs-AI sides should never appear in council output).
  const cleanedTally: Partial<
    Record<"counsel" | "closer" | "counterpart" | "compliance" | "crown", VoteValue>
  > = {};
  for (const [k, v] of Object.entries(tally)) {
    if (
      k === "counsel" ||
      k === "closer" ||
      k === "counterpart" ||
      k === "compliance" ||
      k === "crown"
    ) {
      cleanedTally[k] = v;
    }
  }
  return { moveId, tally: cleanedTally, finalRecommendation: crownMessage };
}

export const councilService: CouncilService = new CouncilServiceImpl();

export function __resetCouncilCacheForTests(): void {
  cache.clear();
  cannedCache = undefined;
}

export const __testInternals = { synthesizeResultFromEvents };
