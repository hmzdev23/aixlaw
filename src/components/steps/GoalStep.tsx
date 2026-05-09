"use client";

import { useEffect, useState } from "react";
import { useWizard } from "@/components/wizard/state";
import { getScenario } from "@/lib/scenarios";

export function GoalStep() {
  const { state, dispatch } = useWizard();
  const scenario = state.scenarioId ? getScenario(state.scenarioId) : null;
  const [v, setV] = useState(state.goal);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Reveal suggestions after a short loading window so the page feels live.
  useEffect(() => {
    const t = setTimeout(() => setShowSuggestions(true), 1500);
    return () => clearTimeout(t);
  }, []);

  function next() {
    dispatch({ type: "SET_GOAL", goal: v.trim() });
    dispatch({ type: "GOTO", step: "context" });
  }

  return (
    <div className="mx-auto flex max-w-[680px] flex-col gap-5">
      <header>
        <h2 className="text-[22px] font-semibold tracking-tight">
          What do you want out of this contract?
        </h2>
        <p className="muted text-[13px]">
          The agents will use this as the win condition while debating. One
          sentence is enough.
        </p>
      </header>

      <textarea
        className="textarea"
        placeholder="e.g. Cap our liability and get paid net-30, close in two weeks."
        value={v}
        onChange={(e) => setV(e.target.value)}
        rows={4}
      />

      <div>
        <p className="label mb-2">Suggestions</p>
        {!showSuggestions ? (
          <div className="flex items-center gap-2 text-[13px]">
            <span className="spinner" />
            <span className="muted">Drafting suggestions tailored to {scenario?.vendor ?? "the deal"}…</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(scenario?.goalSamples ?? []).map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => setV(s)}
                className={`fade-in stagger-${(i % 5) + 1} rounded-full border px-3 py-1.5 text-left text-[12px]`}
                style={{
                  borderColor: "var(--line-strong)",
                  background: v === s ? "var(--accent-soft)" : "white",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-2 flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: "BACK" })}>
          ← Back
        </button>
        <button type="button" className="btn" onClick={next} disabled={v.trim().length < 8}>
          Continue → Brief the agents
        </button>
      </div>
    </div>
  );
}
