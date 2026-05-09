import type { DealSession, EvalService, GhostProfile } from "@/contracts";
import { EngineError } from "../_shared/errors";
import { treeEngine } from "./treeEngine";

/**
 * EvalService: maps a selected node in the bloom to a position score.
 *
 * The starting position (root) is the demo lock: -2.4 (PDF/SCENARIO).
 * The "Brilliant" line is +0.8, "Risky" is -0.4, "Blunder" is -3.5.
 *
 * If the model produces atypical move ids/notations, we fall back to the
 * notation-based mapping.
 */

const NOTATION_SCORES: Record<string, number> = {
  "!!": 0.8,
  "!": 0.4,
  "!?": -0.2,
  "?!": -0.4,
  "??": -3.5,
};

class EvalServiceImpl implements EvalService {
  async scorePosition(
    session: DealSession,
    ghost: GhostProfile,
    selectedNodeId: string
  ): Promise<number> {
    if (!selectedNodeId) {
      throw new EngineError({
        code: "bad_request",
        message: "selectedNodeId is required",
      });
    }
    const tree = await treeEngine.bloom(session, ghost);
    if (selectedNodeId === tree.rootId) {
      return clamp(tree.evalScore);
    }

    const node = tree.nodes[selectedNodeId];
    if (!node) {
      throw new EngineError({
        code: "not_found",
        message: `Tree node not found: ${selectedNodeId}`,
      });
    }
    if (!node.move) {
      return clamp(tree.evalScore);
    }
    const fromNotation = NOTATION_SCORES[node.move.notation];
    if (fromNotation === undefined) return clamp(tree.evalScore);
    return clamp(fromNotation);
  }
}

function clamp(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(-4, Math.min(4, n));
}

export const evalService: EvalService = new EvalServiceImpl();

export const __testInternals = { NOTATION_SCORES, clamp };
