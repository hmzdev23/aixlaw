# Gambit — Data Models

Canonical TypeScript shapes. Implement in `src/lib/contracts/models.ts` (Sprint 0).

Fixture root: `FIXTURE_DIR = "Example Scenario (Optional)"` — see [INTEGRATION_CONTRACTS.md](./INTEGRATION_CONTRACTS.md).

---

## Identity & personas

```ts
export interface Persona {
  id: string;
  displayName: string;
  email: string;
  role:
    | "cofounder_coo"
    | "ae"
    | "gc"
    | "counterparty_legal"
    | "ceo"
    | "demo_admin";
  org: string;
  avatarUrl?: string;
}
```

---

## Currency & regulatory tags

```ts
export type Currency = "CAD" | "USD";

export type RegulatoryRegime = "osfi_b13" | "pipeda" | "law25";
```

---

## Contract documents & redlines

```ts
export type ContractKind = "nda" | "msa" | "spa";

export interface ContractDocument {
  id: string;
  type: ContractKind;
  label: string;
  /** Path key under FIXTURE_DIR, e.g. "msa_initech_redlines.md" */
  originalRef?: string;
  redlinedRef?: string;
}

/** @deprecated use ContractDocument */
export interface MsaDocument {
  id: string;
  title: string;
  parties: { name: string; role: string }[];
  effectiveDate?: string;
  fullTextRef: string;
}

export interface RedlineChange {
  id: string;
  clauseRef: string; // e.g. "7.1 Limitation of Liability"
  summary: string;
  ours: string;
  theirs: string;
  comment?: string;
}
```

---

## Ghost (counterparty model)

```ts
export interface GhostProfile {
  counterpartyId: string; // "initech_procurement"
  displayName: string;
  elo: number; // composite demo metric
  styleLabel: string; // e.g. "Hardline"
  playstyle: string;
  fightsOn: string[];
  oftenConcedes: string[];
  walksWhen: string[];
  trainingSummary: string; // e.g. "Trained on 3 prior Initech vendor deals · N clauses analyzed"
  precedentDealIds: string[];
}
```

---

## Game tree & moves

```ts
export type ChessNotation = "!!" | "!" | "!?" | "?!" | "??";

export interface CandidateMove {
  id: string;
  label: string;
  notation: ChessNotation;
  summary: string;
  closeProbability: number; // 0–1
  /** Retained value in CAD for this deal narrative */
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
  dealLabel: string; // e.g. "CoreBank vendor (2022)"
  quote: string;
  clauseRef: string;
}

export interface WalkawayLine {
  thresholdSummary: string;
  citations: WalkawayCitation[];
}
```

---

## Decision (handoff UI → work product → execution)

```ts
export interface Decision {
  dealId: string;
  chosenMoveId: string;
  counterpartyId: string;
  summaryLegal: string;
  summaryPlain: string;
  financials: {
    currency: Currency; // "CAD" for Initech demo
    monthlyAmount: number; // ~7500 for $180k/24mo narrative
    netDays: number; // e.g. 60 per Initech redline
    months: number; // 24
    tier: string;
    seats: number;
    /** Optional headline for pitch */
    totalContractCad?: number;
  };
  complianceFlags: string[];
  citationsUsed: { title: string; citation: string }[];
  generatedRedlineDocxRef?: string;
  supervisorPdfRef?: string;
}
```

---

## TrueSight & multi-regime compliance

```ts
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

/** Unified bundle returned by ComplianceService.checkProposedText */
export interface ComplianceReport {
  trueSight: TrueSightResult;
  osfi: OsfiResult;
  pipeda: PipedaResult;
  law25: Law25Result;
}
```

---

## Council / War Room

```ts
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
```

---

## Architect / Playbook

```ts
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
```

---

## Spellbook

```ts
export interface SpellbookIssue {
  id: string;
  clauseRef: string;
  severity: "low" | "medium" | "high";
  title: string;
  detail: string;
}
```

---

## Execution timeline

```ts
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
```

---

## AI vs AI (optional)

```ts
export interface AiVsAiInput {
  clauseText: string;
  leftGhostId: string;
  rightGhostId: string;
  maxRounds: number;
}
```

---

## API response wrappers

```ts
export interface ApiError {
  code: string;
  message: string;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };
```
