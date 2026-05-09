import type { EsigResult } from "@/lib/types";

export type ScenarioId = "dunder" | "nimbus";

export interface ScenarioParagraph {
  /** Stable index — used as primary key everywhere. */
  id: number;
  en: string;
  fr: string;
  /** Optional UI tag for highlight chips. */
  flag?: "warn" | "bad" | "info";
  flagReason?: string;
  /** If true, this paragraph contains a signature block to draw on. */
  isSignatureBlock?: boolean;
}

export interface ScenarioAgentBrief {
  agentId: "pierre" | "marie" | "etienne" | "sophie" | "antoine";
  /** 1-2 questions the agent will ask. */
  questions: string[];
  /** Side-panel hint that appears while briefing this agent. */
  hint: { headline: string; detail: string; suggestedAnswer: string };
  /** Two rounds of one-paragraph debate lines. */
  debateRounds: { text: string; delta: number }[][];
}

export interface ScenarioDecisionOption {
  id: string;
  label: string;
  detail: string;
  delta: number;
  /** Edits this option introduces to the contract paragraphs (overrides paragraph EN/FR). */
  edits: { paragraphId: number; replacement: string; replacementFr?: string; sensitive?: boolean }[];
  /** Children options shown after this one is picked. */
  children?: ScenarioDecisionOption[];
}

export interface Scenario {
  id: ScenarioId;
  vendor: string;
  counterparty: string;
  /** Single-line headline shown across the wizard. */
  headline: string;
  /** ARR + key context shown on upload. */
  context: string;
  filenameMarkers: string[];
  paragraphs: ScenarioParagraph[];
  esig: EsigResult;
  /** Goal sample buttons. */
  goalSamples: string[];
  /** Five-agent brief data. */
  agents: ScenarioAgentBrief[];
  /** Root decision options; each option can have children for branching. */
  decisionRoot: ScenarioDecisionOption[];
  /** Markdown-style summary headline used by the post-memo edited-doc step. */
  summaryTitle: string;
  /** Hint chips for the redaction (extra names) input. */
  sensitiveNames: string[];
}
