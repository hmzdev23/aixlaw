import type { EsigResult } from "@/lib/types";

export type ScenarioId = "dunder" | "nimbus";

export interface ScenarioParagraph {
  id: number;
  en: string;
  fr: string;
  flag?: "warn" | "bad" | "info";
  flagReason?: string;
  isSignatureBlock?: boolean;
  /** Which party signs this block. */
  party?: "vendor" | "client";
}

/** One context hint, shown next to a single question. */
export interface ScenarioHint {
  headline: string;
  detail: string;
  suggestedAnswer: string;
}

export interface ScenarioAgentBrief {
  agentId: "pierre" | "marie" | "etienne" | "sophie" | "antoine";
  /** 2 questions, paired 1:1 with `hints`. */
  questions: string[];
  /** 2 hints, paired 1:1 with `questions`. */
  hints: ScenarioHint[];
  /** N rounds of debate lines (one or more lines per round). */
  debateRounds: { text: string; delta: number }[][];
}

export interface ScenarioDecisionOption {
  id: string;
  label: string;
  detail: string;
  delta: number;
  /** Mark a path that ends in a "walk away / loss" outcome. */
  losePath?: boolean;
  edits: {
    paragraphId: number;
    replacement: string;
    replacementFr?: string;
    sensitive?: boolean;
  }[];
  children?: ScenarioDecisionOption[];
}

export interface LawViolation {
  id: string;
  jurisdiction: string;
  shortName: string;
  fullName: string;
  fullNameFr: string;
  blurb: string;
  blurbFr: string;
  severity: "low" | "medium" | "high";
  /** Article or section reference for the citation chip. */
  citation?: string;
}

export interface Scenario {
  id: ScenarioId;
  vendor: string;
  counterparty: string;
  headline: string;
  context: string;
  filenameMarkers: string[];
  paragraphs: ScenarioParagraph[];
  esig: EsigResult;
  /** Hardcoded law violations surfaced after e-sig. */
  lawViolations: LawViolation[];
  goalSamples: string[];
  agents: ScenarioAgentBrief[];
  decisionRoot: ScenarioDecisionOption[];
  /** Number of debate rounds available; tree depth equals this. */
  maxDebateRounds: number;
  summaryTitle: string;
  sensitiveNames: string[];
}
