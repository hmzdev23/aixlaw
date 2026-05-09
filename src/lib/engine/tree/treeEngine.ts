import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import type {
  CandidateMove,
  ChessNotation,
  DealSession,
  GameTree,
  GhostProfile,
  TreeEngine,
} from "@/contracts";
import { jsonChat } from "../_shared/anthropic";
import { TtlCache } from "../_shared/cache";
import { env } from "../_shared/env";
import { EngineError } from "../_shared/errors";
import { repoRoot } from "../_shared/paths";
import { COUNTER_SYSTEM_PROMPT, TREE_SYSTEM_PROMPT, counterUserPrompt, treeUserPrompt } from "./prompts";

/**
 * TreeEngine: produces a Raiffa-style three-branch decision tree (root + three
 * candidate moves with chess notation `!!`, `?!`, `??`).
 *
 * Always returns a tree even on LLM failure (canned). Always returns exactly
 * three primary branches with valid notation. Probabilities are clamped to
 * [0,1] and the brilliant > risky monotonicity is enforced post-hoc.
 */

const NOTATION = ["!!", "!", "!?", "?!", "??"] as const satisfies readonly ChessNotation[];

const CandidateMoveSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(5).max(200),
  notation: z.enum(NOTATION),
  summary: z.string().min(5).max(400),
  closeProbability: z.number().min(0).max(1),
  retainedValueCad: z.number().int().optional(),
  riskNote: z.string().max(400).optional(),
});

const GameTreeNodeSchema = z.object({
  id: z.string().min(1),
  parentId: z.string().nullable(),
  childrenIds: z.array(z.string()),
  ghostReplyPreview: z.string().max(400).optional(),
  move: CandidateMoveSchema.optional(),
});

const GameTreeSchema = z.object({
  rootId: z.string().min(1),
  primaryBranchIds: z.tuple([z.string(), z.string(), z.string()]),
  evalScore: z.number().min(-4).max(4),
  nodes: z.record(z.string(), GameTreeNodeSchema),
}) satisfies z.ZodType<GameTree>;

const cache = new TtlCache<string, GameTree>(15 * 60 * 1000);
const counterCache = new TtlCache<string, string>(60 * 60 * 1000);

const CANNED_PATH = path.join(repoRoot(), "src/lib/fixtures/tree_canned.json");
const CANNED_COUNTER_PATH = path.join(
  repoRoot(),
  "src/lib/fixtures/counter_canned.json"
);

export async function loadCannedTree(): Promise<GameTree> {
  let raw: string;
  try {
    raw = await fs.readFile(CANNED_PATH, "utf8");
  } catch (e) {
    throw new EngineError({
      code: "fixture_missing",
      message: "tree_canned.json missing",
      cause: e,
    });
  }
  const parsed = GameTreeSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new EngineError({
      code: "validation_failed",
      message: `tree_canned.json failed schema: ${parsed.error.message}`,
    });
  }
  return enforceInvariants(parsed.data);
}

async function loadCannedCounter(nodeId: string): Promise<string> {
  let raw: string;
  try {
    raw = await fs.readFile(CANNED_COUNTER_PATH, "utf8");
  } catch (e) {
    throw new EngineError({
      code: "fixture_missing",
      message: "counter_canned.json missing",
      cause: e,
    });
  }
  const map = JSON.parse(raw) as Record<string, string>;
  return (
    map[nodeId] ??
    "Counterparty likely responds with a deferred decision; expect a follow-up note from procurement."
  );
}

class TreeEngineImpl implements TreeEngine {
  async bloom(
    session: DealSession,
    ghost: GhostProfile
  ): Promise<GameTree> {
    if (!session?.dealId) {
      throw new EngineError({
        code: "bad_request",
        message: "DealSession missing dealId",
      });
    }
    const cacheKey = `tree:${session.dealId}:${session.locale}:${ghost.elo}`;
    const hit = cache.get(cacheKey);
    if (hit) return hit;

    if (env.llmDisabled) {
      const canned = await loadCannedTree();
      cache.set(cacheKey, canned);
      return canned;
    }

    try {
      // We don't need full document text here — the Ghost has already
      // distilled the counterparty posture. We pass a thematic summary.
      const redlineSummary = [
        "MSA §7.1 caps liability at 12 months fees but Initech carves out Section 9 (Data) to UNCAPPED.",
        "MSA §2/§9 add 24/7/365 SLA, Ontario-only data, ISO 27001/SOC 2 evidence, $10M cyber insurance, 24h breach notice, audit rights, step-in.",
        "MSA §5/§4 push payment to Net 60, give Initech convenience termination on 30 days, 15-day cure.",
      ].join("\n");

      const tree = await jsonChat(GameTreeSchema, {
        system: TREE_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: treeUserPrompt({
              ghost,
              redlineSummary,
              evalScore: -2.4,
            }),
          },
        ],
        maxTokens: 1800,
      });

      const safe = enforceInvariants(tree);
      cache.set(cacheKey, safe);
      return safe;
    } catch (e) {
      if (env.debug) console.warn("[tree] LLM failed, using canned:", e);
      const canned = await loadCannedTree();
      cache.set(cacheKey, canned);
      return canned;
    }
  }

  async predictCounterMove(
    nodeId: string,
    session: DealSession,
    ghost: GhostProfile
  ): Promise<string> {
    if (!nodeId) {
      throw new EngineError({
        code: "bad_request",
        message: "nodeId is required",
      });
    }
    const cacheKey = `counter:${session.dealId}:${nodeId}:${ghost.elo}`;
    const hit = counterCache.get(cacheKey);
    if (hit) return hit;

    // Find the move by node id from the cached tree if any.
    const tree = await this.bloom(session, ghost);
    const node = tree.nodes[nodeId];
    if (!node) {
      throw new EngineError({
        code: "not_found",
        message: `Tree node not found: ${nodeId}`,
      });
    }
    if (!node.move) {
      const fallback = node.ghostReplyPreview ?? (await loadCannedCounter(nodeId));
      counterCache.set(cacheKey, fallback);
      return fallback;
    }

    if (env.llmDisabled) {
      const fallback = node.ghostReplyPreview ?? (await loadCannedCounter(nodeId));
      counterCache.set(cacheKey, fallback);
      return fallback;
    }

    try {
      const text = await counterChat(ghost, node.move);
      const trimmed = text.trim().slice(0, 320);
      counterCache.set(cacheKey, trimmed);
      return trimmed;
    } catch (e) {
      if (env.debug) console.warn("[counter] LLM failed, using canned:", e);
      const fallback = node.ghostReplyPreview ?? (await loadCannedCounter(nodeId));
      counterCache.set(cacheKey, fallback);
      return fallback;
    }
  }
}

async function counterChat(
  ghost: GhostProfile,
  move: CandidateMove
): Promise<string> {
  // Use a small text-only schema (string) — z.string() with min length.
  const schema = z.string().min(5).max(400);
  // Wrap in a JSON object since jsonChat expects JSON. We'll request JSON {"text": "..."}.
  const wrappedSchema = z.object({ text: schema });
  const wrapped = await jsonChat(wrappedSchema, {
    system: `${COUNTER_SYSTEM_PROMPT}\n\nReturn JSON: {"text": "<one sentence>"}.`,
    messages: [
      {
        role: "user",
        content: counterUserPrompt({
          ghost,
          moveLabel: move.label,
          moveSummary: move.summary,
        }),
      },
    ],
    maxTokens: 250,
  });
  return wrapped.text;
}

/**
 * Enforce invariants on any GameTree we hand back to the UI:
 *   - exactly three primaryBranchIds, all present in nodes, all carrying a move
 *   - notation set is exactly { "!!", "?!", "??" } in order
 *   - root references the three branches as childrenIds
 *   - closeProbability monotonic: brilliant >= risky
 *   - probabilities clamped to [0,1]
 */
function enforceInvariants(tree: GameTree): GameTree {
  const ids = tree.primaryBranchIds;
  if (ids.length !== 3) {
    throw new EngineError({
      code: "validation_failed",
      message: "Tree must have exactly 3 primary branches",
    });
  }

  const root = tree.nodes[tree.rootId];
  if (!root) {
    throw new EngineError({
      code: "validation_failed",
      message: `Tree root '${tree.rootId}' missing from nodes`,
    });
  }
  // Force root to reference primary branches.
  root.childrenIds = [...ids];

  const wantNotation: ChessNotation[] = ["!!", "?!", "??"];
  const moves: CandidateMove[] = [];
  ids.forEach((id, idx) => {
    const node = tree.nodes[id];
    if (!node) {
      throw new EngineError({
        code: "validation_failed",
        message: `Primary branch '${id}' missing from nodes`,
      });
    }
    if (!node.move) {
      throw new EngineError({
        code: "validation_failed",
        message: `Primary branch '${id}' missing 'move'`,
      });
    }
    node.move.notation = wantNotation[idx];
    node.move.id = id;
    node.move.closeProbability = Math.max(
      0,
      Math.min(1, node.move.closeProbability)
    );
    moves.push(node.move);
  });

  // Monotonicity guard: if model claims brilliant probability < risky, swap them.
  if (moves[0].closeProbability < moves[1].closeProbability) {
    const tmp = moves[0].closeProbability;
    moves[0].closeProbability = moves[1].closeProbability;
    moves[1].closeProbability = tmp;
  }
  // Cap brilliant at 0.95 so blunder ("sign-the-bad-deal") can sit above it
  // without exceeding 1.0.
  moves[0].closeProbability = Math.min(0.95, moves[0].closeProbability);
  // Blunder must be the highest probability (signing what they sent always closes).
  moves[2].closeProbability = Math.max(
    moves[2].closeProbability,
    Math.min(0.99, moves[0].closeProbability + 0.05)
  );

  // Clamp eval score for safety.
  tree.evalScore = Math.max(-4, Math.min(4, tree.evalScore));

  return tree;
}

export const treeEngine: TreeEngine = new TreeEngineImpl();

/** Test only. */
export function __resetTreeCachesForTests(): void {
  cache.clear();
  counterCache.clear();
}

// Exported for tests only.
export const __testInternals = {
  enforceInvariants,
  loadCannedCounter,
  GameTreeSchema,
};
