/**
 * Canonical Gambit data models (DATA_MODELS.md).
 *
 * This file is the **single source of truth** for cross-team types.
 * - Editing here without updating docs/DATA_MODELS.md is a contract break.
 * - All branches (hamza/aditya/will) import from here, never re-declare.
 */

// ---------------------------------------------------------------------------
// Identity & personas
// ---------------------------------------------------------------------------

export type PersonaRole =
  | "cofounder_coo"
  | "ae"
  | "gc"
  | "counterparty_legal"
  | "ceo"
  | "demo_admin";

export interface Persona {
  id: string;
  displayName: string;
  email: string;
  role: PersonaRole;
  org: string;
  avatarUrl?: string;
}

// ---------------------------------------------------------------------------
// Currency & regulatory tags
// ---------------------------------------------------------------------------

export type Currency = "CAD" | "USD";
export type RegulatoryRegime = "osfi_b13" | "pipeda" | "law25";

// ---------------------------------------------------------------------------
// Contract documents & redlines
// ---------------------------------------------------------------------------

export type ContractKind = "nda" | "msa" | "spa";

export interface ContractDocument {
  id: string;
  type: ContractKind;
  label: string;
  /** Path key under FIXTURE_DIR, e.g. "msa_initech_redlines.md" */
  originalRef?: string;
  redlinedRef?: string;
}

export interface RedlineChange {
  id: string;
  clauseRef: string;
  summary: string;
  ours: string;
  theirs: string;
  comment?: string;
}

// ---------------------------------------------------------------------------
// Deal session
// ---------------------------------------------------------------------------

export interface DealSession {
  dealId: string;
  /** Dunder AI side */
  vendorId: string;
  /** Initech procurement / legal posture */
  counterpartyId: string;
  documents: ContractDocument[];
  /** Synthetic precedent JSON keys (Aditya / T4) */
  precedentRefs: string[];
  locale: "en" | "fr";
  /** Active pile source — usually msa_initech_redlines */
  activeDocumentId?: string;
}

// ---------------------------------------------------------------------------
// Ghost (counterparty model)
// ---------------------------------------------------------------------------

export interface GhostProfile {
  counterpartyId: string;
  displayName: string;
  /** Composite stubbornness/hardness metric for demo flavor (see GhostEngine notes). */
  elo: number;
  styleLabel: string;
  playstyle: string;
  fightsOn: string[];
  oftenConcedes: string[];
  walksWhen: string[];
  trainingSummary: string;
  precedentDealIds: string[];
}

// ---------------------------------------------------------------------------
// Game tree & moves
// ---------------------------------------------------------------------------

export type ChessNotation = "!!" | "!" | "!?" | "?!" | "??";

export interface CandidateMove {
  id: string;
  label: string;
  notation: ChessNotation;
  summary: string;
  closeProbability: number; // 0..1
  /** Retained value in CAD for this deal narrative */
  retainedValueCad?: number;
  riskNote?: string;
}

export interface GameTreeNode {
  id: string;
  parentId: string | null;
  move?: CandidateMove;
  childrenIds: string[];
  /** Pre-staged ghost reply for hover */
  ghostReplyPreview?: string;
}

export interface GameTree {
  rootId: string;
  nodes: Record<string, GameTreeNode>;
  primaryBranchIds: [string, string, string];
  /** Position score for the user (negative = behind). */
  evalScore: number;
}

export interface WalkawayCitation {
  dealLabel: string;
  quote: string;
  clauseRef: string;
}

export interface WalkawayLine {
  thresholdSummary: string;
  citations: WalkawayCitation[];
}

// ---------------------------------------------------------------------------
// Decision (engine -> work product / execution)
// ---------------------------------------------------------------------------

export interface Decision {
  dealId: string;
  chosenMoveId: string;
  counterpartyId: string;
  summaryLegal: string;
  summaryPlain: string;
  financials: {
    currency: Currency;
    monthlyAmount: number;
    netDays: number;
    months: number;
    tier: string;
    seats: number;
    totalContractCad?: number;
  };
  complianceFlags: string[];
  citationsUsed: { title: string; citation: string }[];
  generatedRedlineDocxRef?: string;
  supervisorPdfRef?: string;
}

// ---------------------------------------------------------------------------
// TrueSight & multi-regime compliance
// ---------------------------------------------------------------------------

export interface CitationClaim {
  raw: string;
  normalized?: string;
}

export interface TrueSightResult {
  status: "clean" | "substituted" | "unverified";
  claims: {
    original: string;
    verified?: string;
    sourceUrl?: string;
  }[];
}

export interface OsfiResult {
  triggered: boolean;
  triggers: string[];
  notes?: string[];
}

export interface PipedaResult {
  triggered: boolean;
  triggers: string[];
  notes?: string[];
}

export interface Law25Result {
  triggered: boolean;
  triggers: string[];
  pia?: PIA;
}

export interface PIA {
  id: string;
  generatedAt: string;
  sectionsEn: Record<string, string>;
  sectionsFr: Record<string, string>;
}

export interface ComplianceReport {
  trueSight: TrueSightResult;
  osfi: OsfiResult;
  pipeda: PipedaResult;
  law25: Law25Result;
}

// ---------------------------------------------------------------------------
// Council / War Room
// ---------------------------------------------------------------------------

export type CouncilRole =
  | "counsel"
  | "closer"
  | "counterpart"
  | "compliance"
  | "crown";

/** AI-vs-AI sides — used by `AiVsAiService`. Same UI lane as Council. */
export type AiVsAiSide = "counterpart_left" | "counterpart_right";

/** Any speaker that can appear in a `DebateEvent`. */
export type DebateAgent = CouncilRole | AiVsAiSide;

export type VoteValue =
  | "accept"
  | "reject"
  | "likely_counter_accept"
  | "clear"
  | "abstain";

export interface DebateEvent {
  t: number;
  agent: DebateAgent;
  message: string;
  vote?: VoteValue;
  influenceDelta?: number;
}

export interface CouncilResult {
  moveId: string;
  tally: Partial<Record<CouncilRole, VoteValue>>;
  /**
   * One-line synthesis from Crown.
   * Convention: starts with "Following <agent>(s): <ACCEPT|REJECT> Move <X>."
   * so the UI can highlight which agents won.
   */
  finalRecommendation: string;
}

// ---------------------------------------------------------------------------
// Architect / Playbook
// ---------------------------------------------------------------------------

export type AgentBlockType =
  | "spellbook_issue_detector"
  | "ghost"
  | "tree"
  | "counsel"
  | "closer"
  | "counterpart"
  | "compliance"
  | "crown"
  | "truesight"
  | "osfi_vendor_management"
  | "pipeda_watcher"
  | "law25"
  | "translator"
  | "slack_notifier"
  | "gmail_drafter"
  | "stripe_webhook"
  | "provisioning_webhook"
  | "notary_router"
  | "supervisor_pdf";

export interface AgentBlock {
  id: string;
  type: AgentBlockType;
  position: { x: number; y: number };
  params: Record<string, number | string | boolean>;
}

export interface PlaybookEdge {
  id: string;
  source: string;
  target: string;
}

export interface Playbook {
  id: string;
  name: string;
  version: string;
  blocks: AgentBlock[];
  edges: PlaybookEdge[];
  createdBy: string;
  updatedAt: string;
}

export interface PlaybookSummary {
  id: string;
  name: string;
  version: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Spellbook
// ---------------------------------------------------------------------------

export interface SpellbookIssue {
  id: string;
  clauseRef: string;
  severity: "low" | "medium" | "high";
  title: string;
  detail: string;
}

// ---------------------------------------------------------------------------
// Execution timeline
// ---------------------------------------------------------------------------

export type TimelineStep =
  | "email_received"
  | "counter_sent"
  | "invoice_generated"
  | "seats_provisioned"
  | "notary_queued";

export interface TimelineEvent {
  step: TimelineStep;
  status: "pending" | "done" | "error";
  at?: string;
  detail?: string;
}

// ---------------------------------------------------------------------------
// AI vs AI (optional, T5)
// ---------------------------------------------------------------------------

export interface AiVsAiInput {
  clauseText: string;
  leftGhostId: string;
  rightGhostId: string;
  maxRounds: number;
}

// ---------------------------------------------------------------------------
// API response wrappers
// ---------------------------------------------------------------------------

export interface ApiError {
  code: string;
  message: string;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };
