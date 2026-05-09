import type {
  ArchitectRuntime,
  Decision,
  DealSession,
  Playbook,
} from "@/contracts";
import { EngineError } from "../_shared/errors";
import {
  EXECUTORS,
  buildDecisionFromContext,
  type PipelineContext,
} from "./executors";
import { ensureCannedDecisionLoaded } from "./_cannedDecision";

/**
 * ArchitectRuntime: walk a Playbook DAG and produce a `Decision`.
 *
 *   - Topological sort (Kahn's algorithm). Cycles → 400 (bad_request).
 *   - Unknown block type → 422 (validation_failed).
 *   - Each block's `params` is read by its executor; un-wired blocks are no-ops.
 *   - Final Decision is built from accumulated PipelineContext.
 */

class ArchitectRuntimeImpl implements ArchitectRuntime {
  async execute(playbook: Playbook, session: DealSession): Promise<Decision> {
    if (!playbook?.blocks?.length) {
      throw new EngineError({
        code: "bad_request",
        message: "Playbook has no blocks",
      });
    }
    const ordered = topoSort(playbook);

    await ensureCannedDecisionLoaded();

    const ctx: PipelineContext = {
      session,
      councilResults: [],
      paramOverrides: {},
      weights: {
        riskTolerance: 0.5,
        urgency: 0.5,
        closeProbabilityTarget: 0.8,
        riskAversion: 0.7,
      },
    };

    for (const block of ordered) {
      const exec = EXECUTORS[block.type];
      if (!exec) {
        throw new EngineError({
          code: "validation_failed",
          message: `Unknown block type: ${block.type as string}`,
        });
      }
      ctx.paramOverrides[block.id] = block.params;
      try {
        await exec(block, ctx);
      } catch (e) {
        // A single executor failure shouldn't kill the entire pipeline; we
        // surface it on the Decision rather than abort. (Demo-grade resilience.)
        const message = e instanceof Error ? e.message : "executor failure";
        ctx.councilResults.push({
          moveId: block.id,
          tally: {},
          finalRecommendation: `Block ${block.id} (${block.type}) failed: ${message}`,
        });
      }
    }

    return buildDecisionFromContext(ctx);
  }
}

/** Kahn's algorithm. Throws on cycles or dangling edges. */
function topoSort(playbook: Playbook) {
  const blockMap = new Map(playbook.blocks.map((b) => [b.id, b] as const));
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const b of playbook.blocks) {
    inDegree.set(b.id, 0);
    adj.set(b.id, []);
  }
  for (const e of playbook.edges) {
    if (!blockMap.has(e.source) || !blockMap.has(e.target)) {
      throw new EngineError({
        code: "validation_failed",
        message: `Edge references unknown block: ${e.source} -> ${e.target}`,
      });
    }
    adj.get(e.source)!.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) if (deg === 0) queue.push(id);
  // Sort to make execution order deterministic across runs.
  queue.sort();

  const ordered: typeof playbook.blocks = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    ordered.push(blockMap.get(id)!);
    for (const next of adj.get(id) ?? []) {
      inDegree.set(next, (inDegree.get(next) ?? 0) - 1);
      if (inDegree.get(next) === 0) {
        queue.push(next);
        queue.sort();
      }
    }
  }

  if (ordered.length !== playbook.blocks.length) {
    throw new EngineError({
      code: "bad_request",
      message: "Playbook contains a cycle",
    });
  }
  return ordered;
}

export const architectRuntime: ArchitectRuntime = new ArchitectRuntimeImpl();

export const __testInternals = { topoSort };
