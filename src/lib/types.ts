export type Locale = "en" | "fr";

export interface ParsedDocument {
  filename: string;
  mime: string;
  text: string;
  pages?: number;
  paragraphs: string[];
  byteSize: number;
}

export interface EsigResult {
  /** True if the document is enforceable in Quebec under the e-sig framework. */
  qcAvailable: boolean;
  /** True if the doc has any signature blocks present. */
  signatureBlocksFound: number;
  notes: string[];
  citations: { label: string; url: string }[];
}

export interface AgentDef {
  id: string;
  name: string;
  role: string;
  blurb: string;
  /** Friendly tagline describing what this agent specializes in. */
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
  /** Score impact for the user's stated goal: -3..+3 */
  delta: number;
  ts: string;
}

export interface DecisionOption {
  id: string;
  label: string;
  detail: string;
  /** Effect on win bar: -3..+3 */
  delta: number;
}

export interface DecisionNode {
  id: string;
  parentId: string | null;
  label: string;
  delta: number;
  cumulativeScore: number;
  chosen: boolean;
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
