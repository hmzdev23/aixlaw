"use client";

import { STEPS, stepIndex, stepLabel, useWizard } from "./state";

export function StepBar() {
  const { state } = useWizard();
  const current = stepIndex(state.step);

  return (
    <ol className="flex w-full flex-wrap items-center gap-2 text-[12px]">
      {STEPS.map((s, i) => {
        const isActive = i === current;
        const isDone = i < current;
        const tone = isActive
          ? { bg: "var(--ink)", color: "white", border: "var(--ink)" }
          : isDone
            ? {
                bg: "white",
                color: "var(--ink)",
                border: "var(--line-strong)",
              }
            : {
                bg: "transparent",
                color: "var(--muted)",
                border: "var(--line)",
              };
        return (
          <li
            key={s}
            className="flex items-center gap-2"
            aria-current={isActive ? "step" : undefined}
          >
            <span
              className="grid h-6 w-6 place-items-center rounded-full border text-[11px] font-medium tabular-nums"
              style={{
                background: tone.bg,
                color: tone.color,
                borderColor: tone.border,
              }}
            >
              {i + 1}
            </span>
            <span
              className="font-medium"
              style={{ color: isActive ? "var(--ink)" : "var(--muted)" }}
            >
              {stepLabel(s)}
            </span>
            {i < STEPS.length - 1 ? (
              <span
                className="mx-1 inline-block h-px w-6"
                style={{ background: "var(--line)" }}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
