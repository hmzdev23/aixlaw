import type { ScenarioId } from "./scenarios/types";

export type Locale = "en" | "fr";

export interface ParsedDocument {
  filename: string;
  mime: string;
  scenarioId: ScenarioId;
  /** Hardcoded EN paragraphs from the matched scenario. */
  paragraphs: string[];
  /** Hardcoded FR paragraphs from the matched scenario, paragraph-aligned. */
  frParagraphs: string[];
  /** Indices of paragraphs that contain a signature block. */
  signatureBlockIndices: number[];
  byteSize: number;
}

export interface EsigResult {
  qcAvailable: boolean;
  signatureBlocksFound: number;
  notes: string[];
  citations: { label: string; url: string }[];
}

export interface AgentDef {
  id: string;
  name: string;
  role: string;
  blurb: string;
  speciality: string;
  emoji: string;
}

export interface ContextAnswer {
  agentId: string;
  question: string;
  answer: string;
}

export type DebateRole = AgentDef["id"];

export interface DebateTurn {
  id: string;
  agentId: string;
  text: string;
  delta: number;
  ts: string;
  /** Round index this turn came from (0, 1, …). */
  round: number;
}

export interface DecisionOption {
  id: string;
  label: string;
  detail: string;
  delta: number;
  /** True when picking this option will modify the contract text. */
  modifiesDoc: boolean;
}

export interface DecisionNode {
  id: string;
  parentId: string | null;
  label: string;
  detail: string;
  delta: number;
  cumulativeScore: number;
  /** Position of this option among its siblings (for tree layout). */
  siblingIndex: number;
  depth: number;
}

export interface BookingRequest {
  title: string;
  whenIso: string;
  durationMins: number;
  attendeeEmail?: string;
  description?: string;
}

export interface SlackPostRequest {
  channel?: string;
  text: string;
  memoTitle?: string;
}

export interface DocumentEdit {
  paragraphId: number;
  /** Original EN text. */
  originalEn: string;
  /** Replacement EN text. */
  replacementEn: string;
  /** Original FR text. */
  originalFr: string;
  /** Replacement FR text. */
  replacementFr: string;
  /** Decision option that introduced this edit. */
  optionId: string;
  optionLabel: string;
  /** True if the edit contains intentionally-sensitive language. */
  sensitive: boolean;
}
