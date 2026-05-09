# Gambit — Integration Contracts

**Purpose:** Typed seams so Hamza / Aditya / Will can work on separate branches without blocking.  
**Sprint 0:** Copy these interfaces into `src/lib/contracts/*.ts` on `main` (single source after that is code; keep this doc in sync on PR).

All types referenced below are defined canonically in [DATA_MODELS.md](./DATA_MODELS.md).

---

## 1. Inbound (Will → App store)

```ts
// Will implements: lib/integrations/inbound.ts + API routes

export type InboundSource = "gmail" | "slack" | "calendar" | "manual_demo";

export interface InboundEvent {
  id: string;
  source: InboundSource;
  receivedAt: string; // ISO
  personaId: string; // links Persona
  dealId: string;
  subject?: string;
  attachments: { name: string; mime: string; storageKey: string }[];
  rawSnippet?: string;
  calendarContext?: {
    nextHardStop: string; // ISO event end or start
    eventTitle: string;
    conflict: boolean;
  };
}

export interface InboundService {
  watchGmail(): AsyncIterable<InboundEvent>;
  handleSlackPayload(body: unknown): Promise<InboundEvent | null>;
  triggerManualDemo(): Promise<InboundEvent>;
}
```

---

## 2. Deal session (shared)

```ts
export interface DealSession {
  dealId: string;
  counterpartyId: string; // "megacorp"
  baseMsaRef: string; // fixture key
  redlinesRef: string; // fixture key (12 changes)
  precedentRefs: string[]; // 3 MegaCorp MSAs
  locale: "en" | "fr";
}
```

---

## 3. Ghost engine (Aditya → UI / Tree)

```ts
export interface GhostEngine {
  generate(session: DealSession): Promise<GhostProfile>;
  /** Optional: refresh after new Spellbook issues */
  refreshFromIssues(session: DealSession, issues: SpellbookIssue[]): Promise<GhostProfile>;
}
```

---

## 4. Game tree (Aditya → UI)

```ts
export interface TreeEngine {
  /** Returns root + 3 primary branches; deeper nodes optional for demo */
  bloom(session: DealSession, ghost: GhostProfile): Promise<GameTree>;
  /** Live hover: predicted counterparty reply for a node */
  predictCounterMove(nodeId: string, session: DealSession, ghost: GhostProfile): Promise<string>;
}

export interface EvalService {
  /** Score in pawns-like units; negative = counterparty favor */
  scorePosition(session: DealSession, ghost: GhostProfile, selectedNodeId: string): Promise<number>;
}
```

---

## 5. Walkaway (Aditya)

```ts
export interface WalkawayService {
  getLine(session: DealSession, ghost: GhostProfile): Promise<WalkawayLine>;
}
```

---

## 6. Compliance bundle (Aditya)

```ts
export interface ComplianceService {
  /** TrueSight + Law 25 in one call for UX; may split internally */
  checkProposedText(text: string, locale: "en" | "fr"): Promise<ComplianceReport>;
}

export interface ComplianceReport {
  trueSight: TrueSightResult;
  law25: Law25Result;
}
```

---

## 7. Council (Aditya → War Room UI)

```ts
export interface CouncilService {
  deliberate(
    moveId: string,
    session: DealSession,
    ghost: GhostProfile,
    options?: { stream?: boolean }
  ): AsyncIterable<DebateEvent>;
}

export interface AiVsAiService {
  runClauseNegotiation(input: AiVsAiInput): AsyncIterable<DebateEvent>;
}
```

---

## 8. Architect runtime (Aditya)

```ts
export interface PlaybookRepository {
  list(): Promise<PlaybookSummary[]>;
  get(id: string): Promise<Playbook>;
  save(playbook: Playbook): Promise<void>;
}

export interface ArchitectRuntime {
  execute(playbook: Playbook, session: DealSession): Promise<Decision>;
}
```

---

## 9. Work product (Will)

```ts
export interface WorkProductService {
  buildCounterRedlineDocx(decision: Decision): Promise<Uint8Array>;
  buildSupervisorPdf(decision: Decision, mode: "legal" | "plain"): Promise<Uint8Array>;
}
```

---

## 10. Voice sign-off (Will)

```ts
export type SignoffState = "pending" | "playing" | "signed" | "rejected";

export interface VoiceSignoffService {
  startPlayback(dealId: string): Promise<void>;
  completeSignoff(dealId: string, approved: boolean): Promise<void>;
  getState(dealId: string): Promise<{ state: SignoffState; signedBy?: string }>;
}
```

---

## 11. Outbound comms (Will)

```ts
export interface OutboundNotifyService {
  slackDealUpdate(payload: SlackDealPayload): Promise<void>;
  createGmailDraft(payload: GmailDraftPayload): Promise<{ draftId: string }>;
}

export interface SlackDealPayload {
  dealId: string;
  title: string;
  body: string;
  locale: "en" | "fr";
}

export interface GmailDraftPayload {
  to: string;
  subject: string;
  body: string;
  attachment?: { filename: string; bytes: Uint8Array };
}
```

---

## 12. Execution engine (Will → Cockpit timeline)

```ts
export interface ExecutionEngine {
  fire(decision: Decision): AsyncIterable<TimelineEvent>;
}

export interface SpellbookClient {
  detectIssues(msaText: string): Promise<SpellbookIssue[]>;
}
```

---

## 13. Translator (Aditya, used by Will for outbound copy)

```ts
export interface Translator {
  toFr(text: string): Promise<string>;
  toEn(text: string): Promise<string>;
}
```

---

## Versioning

- Bump contract version in code: `export const CONTRACT_VERSION = "1.0.0"`.  
- Breaking changes: PR must update this file + notify all three owners.
