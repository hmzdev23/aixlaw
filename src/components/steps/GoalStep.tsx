"use client";

import { useState } from "react";
import { useWizard } from "@/components/wizard/state";

const SAMPLES = [
  "Cap our liability and get paid net-30 — close in 2 weeks.",
  "Protect our IP on custom work and avoid uncapped indemnities.",
  "Lock in a 24-month commitment with mutual termination for cause.",
];

export function GoalStep() {
  const { state, dispatch } = useWizard();
  const [v, setV] = useState(state.goal);

  function next() {
    dispatch({ type: "SET_GOAL", goal: v.trim() });
    dispatch({ type: "GOTO", step: "context" });
  }

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-5">
      <header>
        <h2 className="text-[22px] font-semibold tracking-tight">What do you want out of this contract?</h2>
        <p className="muted text-[13px]">
          The agents will use this as the &quot;win condition&quot; while debating.
          One sentence is enough.
        </p>
      </header>

      <textarea
        className="textarea"
        placeholder="e.g. Cap our liability and get paid net-30 — close in 2 weeks."
        value={v}
        onChange={(e) => setV(e.target.value)}
        rows={4}
      />

      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setV(s)}
            className="rounded-full border px-3 py-1 text-[12px]"
            style={{ borderColor: "var(--line-strong)", background: "white" }}
          >
            {s}
          </button>
        ))}
      </div>

      <Footer
        onBack={() => dispatch({ type: "BACK" })}
        onNext={next}
        disabled={v.trim().length < 10}
      />
    </div>
  );
}

function Footer({
  onBack,
  onNext,
  disabled,
}: {
  onBack: () => void;
  onNext: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-2 flex justify-between">
      <button type="button" className="btn btn-ghost" onClick={onBack}>← Back</button>
      <button type="button" className="btn" disabled={disabled} onClick={onNext}>
        Continue → Brief the agents
      </button>
    </div>
  );
}
