export const CONTRACT_VERSION = "1.1.0";

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

export type Currency = "CAD" | "USD";
export type Locale = "en" | "fr";
export type RegulatoryRegime = "osfi_b13" | "pipeda" | "law25";
export type ContractKind = "nda" | "msa" | "spa";

export interface ContractDocument {
  id: string;
  type: ContractKind;
  label: string;
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

export type ChessNotation = "!!" | "!" | "!?" | "?!" | "??";

export interface CandidateMove {
  id: string;
  label: string;
  notation: ChessNotation;
  summary: string;
  closeProbability: number;
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
  /** Optional locale for outbound + bilingual artifacts (Zod-validated). */
  locale?: Locale;
}

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
  tally: Record<CouncilRole, VoteValue | undefined>;
  finalRecommendation: string;
}

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

export interface SpellbookIssue {
  id: string;
  clauseRef: string;
  severity: "low" | "medium" | "high";
  title: string;
  detail: string;
}

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

export interface AiVsAiInput {
  clauseText: string;
  leftGhostId: string;
  rightGhostId: string;
  maxRounds: number;
}

export type InboundSource = "gmail" | "slack" | "calendar" | "manual_demo";
export type InboundDocumentFocus = "nda" | "msa";

export interface InboundAttachment {
  name: string;
  mime: string;
  storageKey: string;
}

export interface InboundCalendarContext {
  nextHardStop: string;
  eventTitle: string;
  conflict: boolean;
}

export interface InboundEvent {
  id: string;
  source: InboundSource;
  receivedAt: string;
  personaId: string;
  dealId: string;
  subject?: string;
  attachments: InboundAttachment[];
  rawSnippet?: string;
  documentFocus?: InboundDocumentFocus;
  calendarContext?: InboundCalendarContext;
}

export interface DealSession {
  dealId: string;
  vendorId: string;
  counterpartyId: string;
  documents: ContractDocument[];
  precedentRefs: string[];
  locale: Locale;
  activeDocumentId?: string;
}

export interface ApiError {
  code: string;
  message: string;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };
