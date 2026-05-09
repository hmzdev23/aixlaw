# Gambit — Integration Contracts

**Purpose:** Typed seams so Hamza / Aditya / Will can work on separate branches without blocking.  
**Sprint 0:** Copy these interfaces into `src/lib/contracts/*.ts` on `main` (single source after that is code; keep this doc in sync on PR).

All types referenced below are defined canonically in [DATA_MODELS.md](./DATA_MODELS.md).

**Spellbook fixtures (read-only):** `Example Scenario (Optional)/` — do not edit source `.md` / `.docx` files.

---

## 0. Fixture path

```ts
export const FIXTURE_DIR = "Example Scenario (Optional)";
```

---

## 1. Inbound (Will → App store)

```ts
export type InboundSource = "gmail" | "slack" | "calendar" | "manual_demo";

export type InboundDocumentFocus = "nda" | "msa";

export interface InboundEvent {
  id: string;
  source: InboundSource;
  receivedAt: string;
  personaId: string;
  dealId: string;
  subject?: string;
  attachments: { name: string; mime: string; storageKey: string }[];
  rawSnippet?: string;
  /** Which contract drives the Cockpit pile for this session */
  documentFocus?: InboundDocumentFocus;
  calendarContext?: {
    nextHardStop: string;
    eventTitle: string;
    conflict: boolean;
  };
}

export interface InboundService {
  watchGmail(): AsyncIterable<InboundEvent>;
  handleSlackPayload(body: unknown): Promise<InboundEvent | null>;
  /** Optional: which doc to load for manual demo */
  triggerManualDemo(opts?: { documentFocus?: InboundDocumentFocus }): Promise<InboundEvent>;
}
```

---

## 2. Deal session (shared)

```ts
// ContractDocument — see DATA_MODELS.md; import from src/lib/contracts/models.ts in code

export interface DealSession {
  dealId: string;
  /** Dunder AI side */
  vendorId: string; // "dunder_ai"
  /** Initech procurement / legal posture */
  counterpartyId: string; // "initech_procurement"
  documents: ContractDocument[];
  precedentRefs: string[]; // synthetic Initech vendor precedents (T4)
  locale: "en" | "fr";
  /** Active pile source — usually msa_initech_redlines */
  activeDocumentId?: string;
}
```

---

## 3. Ghost engine (Aditya → UI / Tree)

```ts
export interface GhostEngine {
  generate(session: DealSession): Promise<GhostProfile>;
  refreshFromIssues(
    session: DealSession,
    issues: SpellbookIssue[]
  ): Promise<GhostProfile>;
}
```

---

## 4. Game tree (Aditya → UI)

```ts
export interface TreeEngine {
  bloom(session: DealSession, ghost: GhostProfile): Promise<GameTree>;
  predictCounterMove(
    nodeId: string,
    session: DealSession,
    ghost: GhostProfile
  ): Promise<string>;
}

export interface EvalService {
  scorePosition(
    session: DealSession,
    ghost: GhostProfile,
    selectedNodeId: string
  ): Promise<number>;
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
  /** TrueSight + OSFI + PIPEDA + Law25 in one call for UX */
  checkProposedText(
    text: string,
    locale: "en" | "fr"
  ): Promise<ComplianceReport>;
}
```

`ComplianceReport` shape: `{ trueSight, osfi, pipeda, law25 }` — see DATA_MODELS.md.

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
  buildSupervisorPdf(
    decision: Decision,
    mode: "legal" | "plain"
  ): Promise<Uint8Array>;
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
  detectIssues(fullText: string, meta?: { kind: "nda" | "msa" }): Promise<SpellbookIssue[]>;
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

- Bump contract version in code: `export const CONTRACT_VERSION = "1.2.0"`.

  Changelog:
  - **1.2.0** (T5) — `DebateEvent.agent` widened from `CouncilRole` to `DebateAgent` (`CouncilRole | "counterpart_left" | "counterpart_right"`) so AI-vs-AI shares the War Room stream lane.
  - **1.1.0** — Multi-doc `DealSession`, `OsfiResult`, `PipedaResult`, broader `ComplianceReport`, `Currency`.  
- Breaking changes: PR must update this file + notify all three owners.
