# Gambit — Data Models

Canonical TypeScript shapes. Implement in `src/lib/contracts/models.ts` (Sprint 0).

---

## Identity & personas

```ts
export interface Persona {
  id: string;
  displayName: string;
  email: string;
  role: "ae" | "gc" | "counterparty_legal" | "ceo" | "demo_admin";
  org: string;
  avatarUrl?: string;
}
```

---

## Redlines & contract

```ts
export interface RedlineChange {
  id: string;
  clauseRef: string; // e.g. "8.2 Limitation of Liability"
  summary: string;
  ours: string;
  theirs: string;
  comment?: string;
}

export interface MsaDocument {
  id: string;
  title: string;
  parties: { name: string; role: string }[];
  effectiveDate?: string;
  fullTextRef: string; // fixture storage key
}
```

---

## Ghost (counterparty model)

```ts
export interface GhostProfile {
  counterpartyId: string;
  displayName: string;
  elo: number; // composite demo metric
  styleLabel: string; // e.g. "Hardline"
  playstyle: string;
  fightsOn: string[];
  oftenConcedes: string[];
  walksWhen: string[];
  trainingSummary: string; // "Trained on 3 prior deals · 47 clauses analyzed"
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
  summary: string; // one-line strategy
  closeProbability: number; // 0–1
  retainedValueUsd?: number;
  riskNote?: string;
}

export interface GameTreeNode {
  id: string;
  parentId: string | null;
  move?: CandidateMove;
  childrenIds: string[];
  /** Pre-staged ghost reply when hovering child */
  ghostReplyPreview?: string;
}

export interface GameTree {
  rootId: string;
  nodes: Record<string, GameTreeNode>;
  primaryBranchIds: [string, string, string]; // three top moves
  evalScore: number; // negative = bad for us
}

export interface WalkawayCitation {
  dealLabel: string; // "Acme deal (2023)"
  quote: string;
  clauseRef: string;
}

export interface WalkawayLine {
  thresholdSummary: string; // e.g. cap vs ARR
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
    monthlyUsd: number;
    netDays: number;
    months: number;
    tier: string;
    seats: number;
  };
  complianceFlags: string[];
  citationsUsed: { title: string; citation: string }[];
  generatedRedlineDocxRef?: string;
  supervisorPdfRef?: string;
}
```

---

## TrueSight & Law 25

```ts
export interface CitationClaim {
  raw: string; // as model emitted
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

export type VoteValue = "accept" | "reject" | "likely_counter_accept" | "clear" | "abstain";

export interface DebateEvent {
  t: number; // ms offset for animation
  agent: CouncilRole;
  message: string;
  vote?: VoteValue;
  influenceDelta?: number; // 0–1
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
