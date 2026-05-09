"use client";

import { useWizard } from "@/components/wizard/state";
import { getScenario } from "@/lib/scenarios";

export function DoneStep() {
  const { state, dispatch } = useWizard();
  const scenario = state.scenarioId ? getScenario(state.scenarioId) : null;
  const items: { label: string; value: string }[] = [
    { label: "Scenario", value: scenario?.headline ?? "," },
    { label: "Document", value: state.doc?.filename ?? "," },
    { label: "Locale", value: state.locale.toUpperCase() },
    {
      label: "E-signature (Quebec)",
      value: state.esig
        ? state.esig.qcAvailable
          ? `Available · ${state.signatures.length}/${state.esig.signatureBlocksFound} signed`
          : "Restricted"
        : ",",
    },
    { label: "Workflow", value: state.workflow.join(" → ") || "," },
    { label: "Goal", value: state.goal || "," },
    { label: "Final win bar", value: state.score.toFixed(1) },
    {
      label: "Decision path",
      value:
        state.decisionPath.length === 0
          ? "(none)"
          : state.decisionTree
              .filter((n) => state.decisionPath.includes(n.id))
              .map((d) => d.label)
              .join(" → "),
    },
    {
      label: "Translation booking",
      value: state.bookingFromTranslate?.booked
        ? `Booked ${new Date(state.bookingFromTranslate.whenIso!).toLocaleString()}`
        : state.bookingFromTranslate
          ? "Skipped"
          : ",",
    },
    {
      label: "Meeting",
      value: state.meeting?.booked
        ? `Booked ${new Date(state.meeting.whenIso!).toLocaleString()}`
        : state.meetingNeeded === false
          ? "Skipped"
          : ",",
    },
    {
      label: "Memo",
      value: state.memo
        ? `${state.memo.postedToSlack ? "Posted to Slack" : "PDF generated"}${state.memo.redacted ? " · redacted" : ""}`
        : state.memoNeeded === false
          ? "Skipped"
          : ",",
    },
  ];

  return (
    <div className="mx-auto flex max-w-[680px] flex-col gap-5 py-4">
      <header className="text-center">
        <h2 className="text-[26px] font-semibold tracking-tight">All done.</h2>
        <p className="muted mt-2 text-[13px]">Here&apos;s the deal as you ran it.</p>
      </header>

      <ul className="card divide-y divide-[var(--line)] px-5">
        {items.map((it) => (
          <li key={it.label} className="flex items-center justify-between gap-4 py-3 text-[13px]">
            <span className="muted">{it.label}</span>
            <span className="text-right font-medium">{it.value}</span>
          </li>
        ))}
      </ul>

      <div className="flex justify-center">
        <button type="button" className="btn" onClick={() => dispatch({ type: "RESET" })}>
          Start a new document
        </button>
      </div>
    </div>
  );
}
