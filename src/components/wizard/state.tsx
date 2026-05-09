"use client";

import { createContext, useContext, useMemo, useReducer } from "react";
import type {
  ContextAnswer,
  DebateTurn,
  DecisionNode,
  EsigResult,
  Locale,
  ParsedDocument,
} from "@/lib/types";

export const STEPS = [
  "upload",
  "review",
  "esig",
  "workflow",
  "goal",
  "context",
  "warroom",
  "export",
  "meeting",
  "memo",
  "done",
] as const;

export type StepId = (typeof STEPS)[number];

export interface WizardState {
  step: StepId;
  doc: ParsedDocument | null;
  locale: Locale;
  /** Last produced French translation (paragraphs aligned with doc.paragraphs). */
  translation: { lang: "fr"; paragraphs: string[] } | null;
  bookingFromTranslate: { booked: boolean; whenIso?: string } | null;
  esig: EsigResult | null;
  /** Selected agent IDs in the order they appear in the workflow. */
  workflow: string[];
  goal: string;
  context: ContextAnswer[];
  debate: DebateTurn[];
  /** Decision tree path: root -> chosen option -> ... */
  decisions: DecisionNode[];
  /** Win bar score, clamped -10..+10 */
  score: number;
  redactionNames: string[];
  exportedChatUrl: string | null;
  meetingNeeded: boolean | null;
  meeting: { booked: boolean; whenIso?: string; title?: string } | null;
  memoNeeded: boolean | null;
  memo: { pdfUrl: string; postedToSlack: boolean } | null;
}

const INITIAL_STATE: WizardState = {
  step: "upload",
  doc: null,
  locale: "en",
  translation: null,
  bookingFromTranslate: null,
  esig: null,
  workflow: ["pierre", "marie", "etienne", "sophie", "antoine"],
  goal: "",
  context: [],
  debate: [],
  decisions: [],
  score: 0,
  redactionNames: [],
  exportedChatUrl: null,
  meetingNeeded: null,
  meeting: null,
  memoNeeded: null,
  memo: null,
};

export type Action =
  | { type: "GOTO"; step: StepId }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "SET_DOC"; doc: ParsedDocument }
  | { type: "SET_LOCALE"; locale: Locale }
  | {
      type: "SET_TRANSLATION";
      translation: WizardState["translation"];
    }
  | { type: "SET_BOOKING_FROM_TRANSLATE"; booking: WizardState["bookingFromTranslate"] }
  | { type: "SET_ESIG"; esig: EsigResult }
  | { type: "SET_WORKFLOW"; workflow: string[] }
  | { type: "SET_GOAL"; goal: string }
  | { type: "SET_CONTEXT"; context: ContextAnswer[] }
  | { type: "ADD_TURN"; turn: DebateTurn }
  | { type: "ADJUST_SCORE"; delta: number }
  | { type: "ADD_DECISION"; node: DecisionNode }
  | { type: "SET_REDACT_NAMES"; names: string[] }
  | { type: "SET_EXPORTED_CHAT"; url: string }
  | { type: "SET_MEETING_NEEDED"; v: boolean }
  | { type: "SET_MEETING"; meeting: WizardState["meeting"] }
  | { type: "SET_MEMO_NEEDED"; v: boolean }
  | { type: "SET_MEMO"; memo: WizardState["memo"] }
  | { type: "RESET" };

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "GOTO":
      return { ...state, step: action.step };
    case "NEXT": {
      const i = STEPS.indexOf(state.step);
      const next = STEPS[Math.min(i + 1, STEPS.length - 1)];
      return { ...state, step: next };
    }
    case "BACK": {
      const i = STEPS.indexOf(state.step);
      const prev = STEPS[Math.max(i - 1, 0)];
      return { ...state, step: prev };
    }
    case "SET_DOC":
      return { ...state, doc: action.doc };
    case "SET_LOCALE":
      return { ...state, locale: action.locale };
    case "SET_TRANSLATION":
      return { ...state, translation: action.translation };
    case "SET_BOOKING_FROM_TRANSLATE":
      return { ...state, bookingFromTranslate: action.booking };
    case "SET_ESIG":
      return { ...state, esig: action.esig };
    case "SET_WORKFLOW":
      return { ...state, workflow: action.workflow };
    case "SET_GOAL":
      return { ...state, goal: action.goal };
    case "SET_CONTEXT":
      return { ...state, context: action.context };
    case "ADD_TURN":
      return { ...state, debate: [...state.debate, action.turn] };
    case "ADJUST_SCORE":
      return {
        ...state,
        score: Math.max(-10, Math.min(10, state.score + action.delta)),
      };
    case "ADD_DECISION":
      return { ...state, decisions: [...state.decisions, action.node] };
    case "SET_REDACT_NAMES":
      return { ...state, redactionNames: action.names };
    case "SET_EXPORTED_CHAT":
      return { ...state, exportedChatUrl: action.url };
    case "SET_MEETING_NEEDED":
      return { ...state, meetingNeeded: action.v };
    case "SET_MEETING":
      return { ...state, meeting: action.meeting };
    case "SET_MEMO_NEEDED":
      return { ...state, memoNeeded: action.v };
    case "SET_MEMO":
      return { ...state, memo: action.memo };
    case "RESET":
      return { ...INITIAL_STATE };
  }
}

interface Ctx {
  state: WizardState;
  dispatch: React.Dispatch<Action>;
}

const WizardCtx = createContext<Ctx | null>(null);

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <WizardCtx.Provider value={value}>{children}</WizardCtx.Provider>;
}

export function useWizard(): Ctx {
  const v = useContext(WizardCtx);
  if (!v) throw new Error("useWizard must be inside WizardProvider");
  return v;
}

export function stepIndex(step: StepId): number {
  return STEPS.indexOf(step);
}

export function stepLabel(step: StepId): string {
  switch (step) {
    case "upload":
      return "Upload";
    case "review":
      return "Review";
    case "esig":
      return "E-signature";
    case "workflow":
      return "Workflow";
    case "goal":
      return "Goal";
    case "context":
      return "Context";
    case "warroom":
      return "War Room";
    case "export":
      return "Export";
    case "meeting":
      return "Meeting";
    case "memo":
      return "Memo";
    case "done":
      return "Done";
  }
}
