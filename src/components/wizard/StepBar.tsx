"use client";

import { STEPS, stepIndex, stepLabel, useWizard } from "./state";

export function StepBar() {
  const { state } = useWizard();
  const current = stepIndex(state.step);
  const total = STEPS.length;
  // Fill width: at step 1 we still want a tiny sliver, at last step it caps at 100%.
  const fillPct = total <= 1 ? 100 : (current / (total - 1)) * 100;

  return (
    <div className="stepbar">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="stepbar-label" style={{ color: "var(--muted)" }}>
            Step
          </span>
          <span
            className="text-[15px] font-semibold tabular-nums"
            style={{ color: "var(--ink)" }}
          >
            {current + 1}
            <span className="muted text-[12px] font-normal"> of {total}</span>
          </span>
          <span className="mx-1 h-3 w-px" style={{ background: "var(--line-strong)" }} />
          <span
            key={state.step}
            className="fade-in text-[13px] font-semibold"
            style={{ color: "var(--green-deep, #185538)" }}
          >
            {stepLabel(state.step)}
          </span>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          {current > 0 ? (
            <span className="muted text-[11px]">
              ← {stepLabel(STEPS[current - 1])}
            </span>
          ) : null}
          {current < total - 1 ? (
            <span className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
              next: <strong className="font-semibold" style={{ color: "var(--ink)" }}>{stepLabel(STEPS[current + 1])}</strong> →
            </span>
          ) : (
            <span className="text-[11px]" style={{ color: "var(--green-deep, #185538)" }}>
              final step
            </span>
          )}
        </div>
      </div>

      <div className="stepbar-track" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current + 1}>
        <div className="stepbar-fill" style={{ width: `${fillPct}%` }} />
        {STEPS.map((s, i) => {
          const left = total <= 1 ? 100 : (i / (total - 1)) * 100;
          const isDone = i < current;
          const isCurrent = i === current;
          return (
            <span
              key={s}
              className={`stepbar-pip ${isDone ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`}
              style={{ left: `${left}%` }}
              aria-label={stepLabel(s)}
              title={stepLabel(s)}
            />
          );
        })}
      </div>
    </div>
  );
}
