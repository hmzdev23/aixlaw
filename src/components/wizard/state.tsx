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
import type { ScenarioId } from "@/lib/scenarios";

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
  "edited",
  "done",
] as const;

export type StepId = (typeof STEPS)[number];

export interface SignatureRecord {
  /** Index into `doc.paragraphs` where this signature lands. */
  paragraphIndex: number;
  party: "vendor" | "client";
  dataUrl: string;
  signedAt: string;
}

export interface WizardState {
  step: StepId;
  doc: ParsedDocument | null;
  scenarioId: ScenarioId | null;
  locale: Locale;
  bookingFromTranslate: { booked: boolean; whenIso?: string } | null;
  esig: EsigResult | null;
  signatures: SignatureRecord[];
  workflow: string[];
  goal: string;
  context: ContextAnswer[];
  /** Currently active speaker in the war room (for animation). */
  activeAgentId: string | null;
  debate: DebateTurn[];
  /** Number of debate rounds run so far. */
  debateRound: number;
  /** Sequence of chosen decision option ids — drives the tree + edits. */
  decisionPath: string[];
  /** Materialised tree nodes for visual display (additive — new picks add nodes). */
  decisionTree: DecisionNode[];
  /** Win bar score, clamped -10..+10 */
  score: number;
  redactionNames: string[];
  exportedChatUrl: string | null;
  meetingNeeded: boolean | null;
  meeting: { booked: boolean; whenIso?: string; title?: string } | null;
  memoNeeded: boolean | null;
  memo: { pdfUrl: string; postedToSlack: boolean; redacted: boolean } | null;
}

const INITIAL_STATE: WizardState = {
  step: "upload",
  doc: null,
  scenarioId: null,
  locale: "en",
  bookingFromTranslate: null,
  esig: null,
  signatures: [],
  workflow: ["pierre", "marie", "etienne", "sophie", "antoine"],
  goal: "",
  context: [],
  activeAgentId: null,
  debate: [],
  debateRound: 0,
  decisionPath: [],
  decisionTree: [],
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
  | { type: "SET_SCENARIO"; scenarioId: ScenarioId }
  | { type: "SET_LOCALE"; locale: Locale }
  | { type: "SET_BOOKING_FROM_TRANSLATE"; booking: WizardState["bookingFromTranslate"] }
  | { type: "SET_ESIG"; esig: EsigResult }
  | { type: "ADD_SIGNATURE"; sig: SignatureRecord }
  | { type: "CLEAR_SIGNATURE"; paragraphIndex: number }
  | { type: "SET_WORKFLOW"; workflow: string[] }
  | { type: "SET_GOAL"; goal: string }
  | { type: "SET_CONTEXT"; context: ContextAnswer[] }
  | { type: "SET_ACTIVE_AGENT"; agentId: string | null }
  | { type: "ADD_TURN"; turn: DebateTurn }
  | { type: "ADJUST_SCORE"; delta: number }
  | { type: "SET_SCORE"; score: number }
  | { type: "BUMP_ROUND" }
  | {
      type: "PUSH_DECISION";
      node: DecisionNode;
    }
  | { type: "REWIND_TO"; nodeId: string | null }
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
      return { ...state, step: STEPS[Math.min(i + 1, STEPS.length - 1)] };
    }
    case "BACK": {
      const i = STEPS.indexOf(state.step);
      return { ...state, step: STEPS[Math.max(i - 1, 0)] };
    }
    case "SET_DOC":
      return { ...state, doc: action.doc };
    case "SET_SCENARIO":
      return {
        ...state,
        scenarioId: action.scenarioId,
        // Reset persona-style names when scenario changes
        redactionNames:
          state.redactionNames.length === 0 ? state.redactionNames : state.redactionNames,
      };
    case "SET_LOCALE":
      return { ...state, locale: action.locale };
    case "SET_BOOKING_FROM_TRANSLATE":
      return { ...state, bookingFromTranslate: action.booking };
    case "SET_ESIG":
      return { ...state, esig: action.esig };
    case "ADD_SIGNATURE":
      return {
        ...state,
        signatures: [
          ...state.signatures.filter((s) => s.paragraphIndex !== action.sig.paragraphIndex),
          action.sig,
        ],
      };
    case "CLEAR_SIGNATURE":
      return {
        ...state,
        signatures: state.signatures.filter((s) => s.paragraphIndex !== action.paragraphIndex),
      };
    case "SET_WORKFLOW":
      return { ...state, workflow: action.workflow };
    case "SET_GOAL":
      return { ...state, goal: action.goal };
    case "SET_CONTEXT":
      return { ...state, context: action.context };
    case "SET_ACTIVE_AGENT":
      return { ...state, activeAgentId: action.agentId };
    case "ADD_TURN":
      return { ...state, debate: [...state.debate, action.turn] };
    case "ADJUST_SCORE":
      return {
        ...state,
        score: Math.max(-10, Math.min(10, state.score + action.delta)),
      };
    case "SET_SCORE":
      return { ...state, score: Math.max(-10, Math.min(10, action.score)) };
    case "BUMP_ROUND":
      return { ...state, debateRound: state.debateRound + 1 };
    case "PUSH_DECISION": {
      const newPath = [...state.decisionPath, action.node.id];
      const newTree = [...state.decisionTree, action.node];
      return {
        ...state,
        decisionPath: newPath,
        decisionTree: newTree,
        score: Math.max(-10, Math.min(10, action.node.cumulativeScore)),
      };
    }
    case "REWIND_TO": {
      // Trim the path back to (and including) the target node, dropping later picks.
      const target = action.nodeId;
      if (target === null) {
        return { ...state, decisionPath: [], score: 0 };
      }
      const idx = state.decisionPath.indexOf(target);
      if (idx === -1) return state;
      const newPath = state.decisionPath.slice(0, idx + 1);
      const node = state.decisionTree.find((n) => n.id === target);
      const newScore = node?.cumulativeScore ?? 0;
      return {
        ...state,
        decisionPath: newPath,
        score: Math.max(-10, Math.min(10, newScore)),
      };
    }
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
      return "E-sig";
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
    case "edited":
      return "Edited Doc";
    case "done":
      return "Done";
  }
}
