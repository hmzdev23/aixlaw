"use client";

import { useEffect, useState } from "react";
import { useWizard } from "@/components/wizard/state";
import type { LawViolation } from "@/lib/scenarios/types";

export function ViolationsStep() {
  const { state, dispatch } = useWizard();
  const [violations, setViolations] = useState<LawViolation[]>([]);
  const [phase, setPhase] = useState<"scanning" | "ready">("scanning");
  const [error, setError] = useState<string | null>(null);
  const [showFr, setShowFr] = useState(false);

  useEffect(() => {
    if (!state.scenarioId) return;
    setPhase("scanning");
    setError(null);
    let alive = true;

    const fetchPromise = fetch("/api/violations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scenarioId: state.scenarioId }),
    });

    const timer = setTimeout(async () => {
      try {
        const r = await fetchPromise;
        const j = (await r.json()) as
          | { ok: true; data: { violations: LawViolation[] } }
          | { ok: false; error: { message: string } };
        if (!alive) return;
        if (!j.ok) throw new Error(j.error.message);
        setViolations(j.data.violations);
        setPhase("ready");
      } catch (e) {
        if (!alive) return;
        setError((e as Error).message);
        setPhase("ready");
      }
    }, 2500);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [state.scenarioId]);

  if (phase === "scanning") {
    return (
      <div className="mx-auto flex max-w-[520px] flex-col items-center gap-5 py-12 text-center">
        <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
        <h2 className="text-[20px] font-semibold tracking-tight">
          Scanning entire Canada and Québec law jurisdictions
        </h2>
        <p className="muted text-[13px]">
          Cross-referencing the contract against federal statutes, provincial
          civil codes, and sector regulators.
        </p>
        <div className="card w-full px-5 py-3 text-left">
          {[
            "PIPEDA, Personal Information Protection Act",
            "Civil Code of Québec",
            "Charter of the French Language (Bill 96)",
            "Law 25, private-sector privacy",
            "Law 5, health and social services info",
            "PHIPA + Information and Privacy Commissioner of Ontario",
            "OSFI Guideline B-13",
          ].map((s, i) => (
            <p key={s} className={`fade-in stagger-${(i % 5) + 1} muted py-1 text-[12px]`}>
              · {s}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3 fade-in">
        <div>
          <span
            className="inline-block rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{
              borderColor: "var(--negative)",
              color: "var(--negative)",
              background: "#fdecea",
            }}
          >
            Step &middot; Compliance
          </span>
          <h2 className="mt-2 text-[24px] font-semibold tracking-tight">
            Potential law violations
          </h2>
          <p className="subhead text-[13px]">
            {violations.length} cross-jurisdiction risk{violations.length === 1 ? "" : "s"} flagged.
            Toggle français for the same blurb in French.
          </p>
        </div>
        <div className="flex overflow-hidden rounded-full border" style={{ borderColor: "var(--line-strong)" }}>
          <button
            type="button"
            onClick={() => setShowFr(false)}
            className="px-3 py-1 text-[12px] font-medium"
            style={{
              background: !showFr ? "var(--ink)" : "white",
              color: !showFr ? "white" : "var(--ink)",
            }}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setShowFr(true)}
            className="px-3 py-1 text-[12px] font-medium"
            style={{
              background: showFr ? "var(--ink)" : "white",
              color: showFr ? "white" : "var(--ink)",
            }}
          >
            FR
          </button>
        </div>
      </header>

      {error ? (
        <p className="text-[13px]" style={{ color: "var(--negative)" }}>{error}</p>
      ) : null}

      <div className="flex flex-col gap-3">
        {violations.map((v, i) => (
          <ViolationAlert key={v.id} v={v} showFr={showFr} index={i} />
        ))}
      </div>

      <div className="mt-2 flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: "BACK" })}>
          &larr; Back
        </button>
        <button
          type="button"
          className="btn btn-accent"
          onClick={() => dispatch({ type: "GOTO", step: "workflow" })}
        >
          Continue &rarr; Build the workflow
        </button>
      </div>
    </div>
  );
}

function ViolationAlert({
  v,
  showFr,
  index,
}: {
  v: LawViolation;
  showFr: boolean;
  index: number;
}) {
  const tone =
    v.severity === "high"
      ? { color: "var(--negative)", bg: "#fdecea" }
      : v.severity === "medium"
        ? { color: "var(--warning)", bg: "#fff4d6" }
        : { color: "var(--ink-soft)", bg: "var(--accent-soft)" };
  return (
    <article
      className={`card lift-on-hover fade-in stagger-${(index % 5) + 1} px-5 py-4`}
      style={{ borderLeft: `4px solid ${tone.color}` }}
    >
      <div className="flex flex-wrap items-baseline gap-2">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
          style={{ background: tone.bg, color: tone.color }}
        >
          {v.severity} severity
        </span>
        <span
          className="rounded-full border px-2 py-0.5 text-[11px]"
          style={{ borderColor: "var(--line-strong)" }}
        >
          {v.jurisdiction}
        </span>
        {v.citation ? (
          <span
            className="rounded-full border px-2 py-0.5 text-[11px] font-mono"
            style={{ borderColor: "var(--line-strong)" }}
          >
            {v.citation}
          </span>
        ) : null}
      </div>
      <h3 className="mt-2 text-[15px] font-semibold">
        {v.shortName} <span className="muted font-normal">·</span>{" "}
        {showFr ? v.fullNameFr : v.fullName}
      </h3>
      <p className="mt-1 text-[13px] leading-relaxed">
        {showFr ? v.blurbFr : v.blurb}
      </p>
    </article>
  );
}
