import type {
  AgentBlock,
  AgentBlockType,
  ComplianceReport,
  CouncilResult,
  Decision,
  DealSession,
  GameTree,
  GhostProfile,
  SpellbookIssue,
} from "@/contracts";
import { complianceService } from "../compliance";
import { councilService } from "../council/councilService";
import { ghostEngine } from "../ghost/ghostEngine";
import { evalService } from "../tree/evalService";
import { treeEngine } from "../tree/treeEngine";
import { decision_canned } from "./_cannedDecision";

/**
 * Executor pipeline for the Architect runtime.
 *
 * Each block contributes to a shared `PipelineContext` that the runtime
 * mutates as it walks the topological order. Final stages (crown,
 * supervisor_pdf) read accumulated state to produce a Decision.
 */

export interface PipelineContext {
  readonly session: DealSession;
  spellbookIssues?: SpellbookIssue[];
  ghost?: GhostProfile;
  tree?: GameTree;
  evalScore?: number;
  compliance?: ComplianceReport;
  councilResults: CouncilResult[];
  /**
   * Per-block params override the static playbook params; merge happens in the
   * runtime before the executor runs. Stored here for diagnostic dumps.
   */
  paramOverrides: Record<string, AgentBlock["params"]>;
  /**
   * Soft "weights" tuned by sliders. Pure metadata; the engine does not yet
   * change behavior dramatically based on these — but they're surfaced in the
   * Decision summary so demos can visibly differentiate playbooks.
   */
  weights: {
    riskTolerance: number; // 0..1 (default 0.5)
    urgency: number; // 0..1
    closeProbabilityTarget: number; // 0..1
    riskAversion: number; // 0..1 (Counsel slider)
  };
}

export interface BlockResult {
  /** Brief one-line note for diagnostics; surfaces in Decision.complianceFlags. */
  note?: string;
  /** True when this block contributed work the Decision cares about. */
  ranLogic?: boolean;
}

export type ExecutorFn = (
  block: AgentBlock,
  ctx: PipelineContext
) => Promise<BlockResult>;

/** Read a numeric param with a default. */
function num(block: AgentBlock, key: string, def: number): number {
  const v = block.params[key];
  return typeof v === "number" && Number.isFinite(v) ? v : def;
}

const ghostExec: ExecutorFn = async (block, ctx) => {
  let ghost = await ghostEngine.generate(ctx.session);
  if (ctx.spellbookIssues && ctx.spellbookIssues.length > 0) {
    ghost = await ghostEngine.refreshFromIssues(ctx.session, ctx.spellbookIssues);
  }
  ctx.ghost = ghost;
  return { note: `Ghost ELO ${ghost.elo} (${ghost.styleLabel})`, ranLogic: true };
};

const treeExec: ExecutorFn = async (block, ctx) => {
  if (!ctx.ghost) ctx.ghost = await ghostEngine.generate(ctx.session);
  ctx.tree = await treeEngine.bloom(ctx.session, ctx.ghost);
  ctx.weights.closeProbabilityTarget = num(
    block,
    "closeProbabilityTarget",
    ctx.weights.closeProbabilityTarget
  );
  ctx.weights.riskTolerance = num(block, "riskTolerance", ctx.weights.riskTolerance);
  ctx.evalScore = await evalService.scorePosition(
    ctx.session,
    ctx.ghost,
    ctx.tree.primaryBranchIds[0]
  );
  return {
    note: `Tree bloomed; brilliant-line eval ${ctx.evalScore.toFixed(2)}`,
    ranLogic: true,
  };
};

const complianceExec: ExecutorFn = async (_block, ctx) => {
  if (!ctx.tree) ctx.tree = await treeEngine.bloom(ctx.session, ctx.ghost!);
  const move = ctx.tree.nodes[ctx.tree.primaryBranchIds[0]].move;
  const text = move ? `${move.label}\n${move.summary}` : "";
  ctx.compliance = await complianceService().checkProposedText(text, ctx.session.locale);
  return {
    note: `Compliance: OSFI=${ctx.compliance.osfi.triggered ? "triggered" : "ok"} · PIPEDA=${
      ctx.compliance.pipeda.triggered ? "triggered" : "ok"
    } · Law25=${ctx.compliance.law25.triggered ? "triggered" : "ok"} · TrueSight=${
      ctx.compliance.trueSight.status
    }`,
    ranLogic: true,
  };
};

/**
 * Runs the Council on the brilliant move and stores the result. We don't
 * stream from inside the runtime — the runtime returns a Decision; the War
 * Room stream uses CouncilService directly.
 */
const councilExec: ExecutorFn = async (_block, ctx) => {
  if (!ctx.tree) ctx.tree = await treeEngine.bloom(ctx.session, ctx.ghost!);
  const moveId = ctx.tree.primaryBranchIds[0];
  const events = [];
  for await (const ev of councilService.deliberate(moveId, ctx.session, ctx.ghost!)) {
    events.push(ev);
  }
  const final = events.find((e) => e.agent === "crown");
  ctx.councilResults.push({
    moveId,
    tally: { crown: final?.vote },
    finalRecommendation: final?.message ?? "Following Council: pending.",
  });
  return { note: `Crown: ${final?.message ?? "(no synthesis)"}`, ranLogic: true };
};

const noOpExec: ExecutorFn = async () => ({ ranLogic: false });

const counselExec: ExecutorFn = async (block, ctx) => {
  ctx.weights.riskAversion = num(block, "riskAversion", ctx.weights.riskAversion);
  return { note: `Counsel risk-aversion ${ctx.weights.riskAversion.toFixed(2)}`, ranLogic: false };
};
const closerExec: ExecutorFn = async (block, ctx) => {
  ctx.weights.urgency = num(block, "urgency", ctx.weights.urgency);
  return { note: `Closer urgency ${ctx.weights.urgency.toFixed(2)}`, ranLogic: false };
};

const spellbookExec: ExecutorFn = async (_block, ctx) => {
  // T9 (Will) provides the real client. Until then, emit no issues so the
  // pipeline doesn't fail; T4 ghost has its own canned profile to rely on.
  ctx.spellbookIssues = ctx.spellbookIssues ?? [];
  return { note: `Spellbook: ${ctx.spellbookIssues.length} issues`, ranLogic: true };
};

export const EXECUTORS: Record<AgentBlockType, ExecutorFn> = {
  spellbook_issue_detector: spellbookExec,

  ghost: ghostExec,
  tree: treeExec,

  counsel: counselExec,
  closer: closerExec,
  counterpart: noOpExec,
  compliance: complianceExec,
  crown: councilExec,

  truesight: noOpExec,
  osfi_vendor_management: noOpExec,
  pipeda_watcher: noOpExec,
  law25: noOpExec,
  translator: noOpExec,

  slack_notifier: noOpExec,
  gmail_drafter: noOpExec,
  stripe_webhook: noOpExec,
  provisioning_webhook: noOpExec,
  notary_router: noOpExec,

  supervisor_pdf: noOpExec,
};

/**
 * Build a Decision from the accumulated pipeline state.
 *
 * Falls back to the canned decision when the pipeline didn't produce a Tree
 * (impossible if the playbook contains a `tree` block, but defensive).
 */
export function buildDecisionFromContext(ctx: PipelineContext): Decision {
  const cannedDecision = decision_canned();
  if (!ctx.tree || !ctx.ghost) return cannedDecision;

  const moveId = ctx.tree.primaryBranchIds[0];
  const move = ctx.tree.nodes[moveId].move;
  const flags: string[] = [];
  if (ctx.compliance?.osfi.triggered) flags.push(`OSFI: ${ctx.compliance.osfi.triggers.length} themes`);
  if (ctx.compliance?.pipeda.triggered) flags.push(`PIPEDA: ${ctx.compliance.pipeda.triggers.length} themes`);
  if (ctx.compliance?.law25.triggered) flags.push("Law 25 triggered");
  if (flags.length === 0) flags.push("No regulated triggers detected");

  return {
    dealId: ctx.session.dealId,
    chosenMoveId: moveId,
    counterpartyId: ctx.ghost.counterpartyId,
    summaryLegal: move?.label ?? cannedDecision.summaryLegal,
    summaryPlain: move?.summary ?? cannedDecision.summaryPlain,
    financials: cannedDecision.financials,
    complianceFlags: flags,
    citationsUsed: cannedDecision.citationsUsed,
  };
}
