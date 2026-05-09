/**
 * Cross-team integration seams. Mirrors docs/INTEGRATION_CONTRACTS.md.
 *
 * Implementations live under src/lib/integrations/* (Will), src/lib/engine/*
 * (Aditya), src/lib/workproduct/* (Will), src/lib/execution/* (Will).
 */

import type {
  AiVsAiInput,
  ComplianceReport,
  Decision,
  DealSession,
  GameTree,
  GhostProfile,
  InboundDocumentFocus,
  InboundEvent,
  Locale,
  Persona,
  Playbook,
  PlaybookSummary,
  SpellbookIssue,
  TimelineEvent,
  WalkawayLine,
  DebateEvent,
} from "./models";

// -----------------------------------------------------------------------------
// Fixture path
// -----------------------------------------------------------------------------

/** Spellbook pack location — read-only source files. */
export const FIXTURE_DIR = "Example Scenario (Optional)" as const;

// -----------------------------------------------------------------------------
// Inbound (Will -> App store)
// -----------------------------------------------------------------------------

export type { InboundSource, InboundAttachment, InboundCalendarContext } from "./models";

export interface InboundService {
  watchGmail(): AsyncIterable<InboundEvent>;
  handleSlackPayload(body: unknown): Promise<InboundEvent | null>;
  /** Optional: which doc to load for manual demo. */
  triggerManualDemo(opts?: {
    documentFocus?: InboundDocumentFocus;
  }): Promise<InboundEvent>;
}

// -----------------------------------------------------------------------------
// Engine (Aditya — T4..T6)
// -----------------------------------------------------------------------------

export interface GhostEngine {
  generate(session: DealSession): Promise<GhostProfile>;
  refreshFromIssues(
    session: DealSession,
    issues: SpellbookIssue[],
  ): Promise<GhostProfile>;
}

export interface TreeEngine {
  bloom(session: DealSession, ghost: GhostProfile): Promise<GameTree>;
  predictCounterMove(
    nodeId: string,
    session: DealSession,
    ghost: GhostProfile,
  ): Promise<string>;
}

export interface EvalService {
  scorePosition(
    session: DealSession,
    ghost: GhostProfile,
    selectedNodeId: string,
  ): Promise<number>;
}

export interface WalkawayService {
  getLine(session: DealSession, ghost: GhostProfile): Promise<WalkawayLine>;
}

export interface ComplianceService {
  /** TrueSight + OSFI + PIPEDA + Law25 in one call. */
  checkProposedText(text: string, locale: Locale): Promise<ComplianceReport>;
}

export interface CouncilService {
  deliberate(
    moveId: string,
    session: DealSession,
    ghost: GhostProfile,
    options?: { stream?: boolean },
  ): AsyncIterable<DebateEvent>;
}

export interface AiVsAiService {
  runClauseNegotiation(input: AiVsAiInput): AsyncIterable<DebateEvent>;
}

export interface PlaybookRepository {
  list(): Promise<PlaybookSummary[]>;
  get(id: string): Promise<Playbook>;
  save(playbook: Playbook): Promise<void>;
}

export interface ArchitectRuntime {
  execute(playbook: Playbook, session: DealSession): Promise<Decision>;
}

export interface Translator {
  toFr(text: string): Promise<string>;
  toEn(text: string): Promise<string>;
}

// -----------------------------------------------------------------------------
// Outbound (Will — T8 / T9)
// -----------------------------------------------------------------------------

export interface WorkProductService {
  buildCounterRedlineDocx(decision: Decision): Promise<Uint8Array>;
  buildSupervisorPdf(
    decision: Decision,
    mode: "legal" | "plain",
  ): Promise<Uint8Array>;
}

export type SignoffState = "pending" | "playing" | "signed" | "rejected";

export interface VoiceSignoffService {
  startPlayback(dealId: string): Promise<void>;
  completeSignoff(dealId: string, approved: boolean): Promise<void>;
  getState(dealId: string): Promise<{ state: SignoffState; signedBy?: string }>;
}

export interface SlackDealPayload {
  dealId: string;
  title: string;
  body: string;
  locale: Locale;
}

export interface GmailDraftPayload {
  to: string;
  subject: string;
  body: string;
  attachment?: { filename: string; bytes: Uint8Array };
}

export interface OutboundNotifyService {
  slackDealUpdate(payload: SlackDealPayload): Promise<void>;
  createGmailDraft(payload: GmailDraftPayload): Promise<{ draftId: string }>;
}

export interface ExecutionEngine {
  fire(decision: Decision): AsyncIterable<TimelineEvent>;
}

export interface SpellbookClient {
  detectIssues(
    fullText: string,
    meta?: { kind: "nda" | "msa" },
  ): Promise<SpellbookIssue[]>;
}

// -----------------------------------------------------------------------------
// Personas API (Will — T7)
// -----------------------------------------------------------------------------

export interface PersonasResponse {
  personas: Persona[];
}
