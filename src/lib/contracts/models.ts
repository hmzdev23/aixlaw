/**
 * Canonical data shapes for Gambit. Mirrors docs/DATA_MODELS.md.
 *
 * RULES (see docs/BRANCHING_AND_GIT.md "Do-not-touch zones"):
 *   - Breaking changes need ack from Will + Aditya + Hamza.
 *   - Update docs/INTEGRATION_CONTRACTS.md in the same PR as any change here.
 *   - Bump CONTRACT_VERSION on breaking changes.
 */

export const CONTRACT_VERSION = "1.0.0" as const;

// -----------------------------------------------------------------------------
// Identity & personas
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Currency & regulatory tags
// -----------------------------------------------------------------------------

export type Currency = "CAD" | "USD";
export type RegulatoryRegime = "osfi_b13" | "pipeda" | "law25";
export type Locale = "en" | "fr";

// -----------------------------------------------------------------------------
// Contract documents & redlines
// -----------------------------------------------------------------------------

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
  /** Use SCENARIO_CONTEXT IDs: "R01"-"R13" (MSA), "N01"-"N05" (NDA). */
  id: string;
  clauseRef: string;
  summary: string;
  ours: string;
  theirs: string;
  comment?: string;
}

// -----------------------------------------------------------------------------
// Ghost (counterparty model)
// -----------------------------------------------------------------------------

export interface GhostProfile {
  counterpartyId: string;
  displayName: string;
  elo: number;
  styleLabel: string;
  playstyle: string;
  fightsOn: string[];
  oftenConcedes: string[];
  walksWhen: string[];
  trainingSummary: string;
  precedentDealIds: string[];
}

// -----------------------------------------------------------------------------
// Game tree & moves
// -----------------------------------------------------------------------------

export type ChessNotation = "!!" | "!" | "!?" | "?!" | "??";

export interface CandidateMove {
  id: string;
  label: string;
  notation: ChessNotation;
  summary: string;
  closeProbability: number; // 0–1
  retainedValueCad?: number;
  riskNote?: string;
}

export interface GameTreeNode {
  id: string;
  parentId: string | null;
  move?: CandidateMove;
  childrenIds: string[];
  ghostReplyPreview?: string;
}

export interface GameTree {
  rootId: string;
  nodes: Record<string, GameTreeNode>;
  primaryBranchIds: [string, string, string];
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

// -----------------------------------------------------------------------------
// Decision (handoff UI -> work product -> execution)
// -----------------------------------------------------------------------------

export interface DecisionFinancials {
  currency: Currency;
  monthlyAmount: number;
  netDays: number;
  months: number;
  tier: string;
  seats: number;
  totalContractCad?: number;
}

export interface CitationUsed {
  title: string;
  citation: string;
}

export interface Decision {
  dealId: string;
  chosenMoveId: string;
  counterpartyId: string;
  summaryLegal: string;
  summaryPlain: string;
  financials: DecisionFinancials;
  complianceFlags: string[];
  citationsUsed: CitationUsed[];
  generatedRedlineDocxRef?: string;
  supervisorPdfRef?: string;
  /** Demo language for outbound copy. Defaults to "en". */
  locale?: Locale;
}

// -----------------------------------------------------------------------------
// TrueSight & multi-regime compliance
// -----------------------------------------------------------------------------

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

export interface PIA {
  id: string;
  generatedAt: string;
  sectionsEn: Record<string, string>;
  sectionsFr: Record<string, string>;
}

export interface Law25Result {
  triggered: boolean;
  triggers: string[];
  pia?: PIA;
}

export interface ComplianceReport {
  trueSight: TrueSightResult;
  osfi: OsfiResult;
  pipeda: PipedaResult;
  law25: Law25Result;
}

// -----------------------------------------------------------------------------
// Council / War Room
// -----------------------------------------------------------------------------

export type CouncilRole =
  | "counsel"
  | "closer"
  | "counterpart"
  | "compliance"
  | "crown";

export type VoteValue =
  | "accept"
  | "reject"
  | "likely_counter_accept"
  | "clear"
  | "abstain";

export interface DebateEvent {
  t: number;
  agent: CouncilRole;
  message: string;
  vote?: VoteValue;
  influenceDelta?: number;
}

export interface CouncilResult {
  moveId: string;
  tally: Partial<Record<CouncilRole, VoteValue>>;
  finalRecommendation: string;
}

// -----------------------------------------------------------------------------
// Architect / Playbook
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Spellbook
// -----------------------------------------------------------------------------

export interface SpellbookIssue {
  id: string; // "R03", "N01" etc.
  clauseRef: string;
  severity: "low" | "medium" | "high";
  title: string;
  detail: string;
}

// -----------------------------------------------------------------------------
// Execution timeline
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// AI vs AI (optional)
// -----------------------------------------------------------------------------

export interface AiVsAiInput {
  clauseText: string;
  leftGhostId: string;
  rightGhostId: string;
  maxRounds: number;
}

// -----------------------------------------------------------------------------
// API response wrappers
// -----------------------------------------------------------------------------

export interface ApiError {
  code: string;
  message: string;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };
