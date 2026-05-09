"use client";

import { useEffect, useState } from "react";
import { useWizard } from "@/components/wizard/state";
import { Typewriter } from "@/components/ui/Typewriter";
import type { LawViolation } from "@/lib/scenarios/types";

const LOADER_MS = 4500;

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
    }, LOADER_MS);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [state.scenarioId]);

  if (phase === "scanning") {
    return <ScanningPanel />;
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
            {violations.length} cross-jurisdiction risk
            {violations.length === 1 ? "" : "s"} flagged. Toggle français for the
            same blurb in French.
          </p>
        </div>
        <div
          className="flex overflow-hidden rounded-full border"
          style={{ borderColor: "var(--line-strong)" }}
        >
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
        <p className="text-[13px]" style={{ color: "var(--negative)" }}>
          {error}
        </p>
      ) : null}

      <div className="flex flex-col">
        {violations.map((v, i) => (
          <ViolationDossier
            key={`${v.id}-${showFr ? "fr" : "en"}`}
            v={v}
            showFr={showFr}
            index={i}
            total={violations.length}
          />
        ))}
      </div>

      <div className="mt-2 flex justify-between">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => dispatch({ type: "BACK" })}
        >
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

const SCAN_LINES = [
  "Loading PIPEDA, Personal Information Protection Act",
  "Loading Civil Code of Quebec",
  "Loading Charter of the French Language (Bill 96)",
  "Loading Law 25 (private-sector privacy)",
  "Loading Law 5 (health and social services info)",
  "Loading PHIPA + IPC Ontario",
  "Loading OSFI Guideline B-13",
  "Cross-referencing clauses against statutes",
  "Sorting risks by severity",
];

function ScanningPanel() {
  const [tick, setTick] = useState(0);
  const [done, setDone] = useState<boolean[]>(() =>
    Array(SCAN_LINES.length).fill(false),
  );

  // Fan out the "log lines" so the panel feels alive over the full loader.
  useEffect(() => {
    const perLine = LOADER_MS / SCAN_LINES.length;
    const t = setInterval(() => {
      setTick((n) => {
        const next = Math.min(n + 1, SCAN_LINES.length);
        setDone((arr) => {
          const cp = [...arr];
          if (next - 1 >= 0) cp[next - 1] = true;
          return cp;
        });
        return next;
      });
    }, perLine);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center gap-5 py-12 text-center">
      <span
        className="spinner breathe-green"
        style={{
          width: 30,
          height: 30,
          borderWidth: 3,
          borderTopColor: "var(--green)",
        }}
      />
      <h2 className="text-[20px] font-semibold tracking-tight">
        Scanning entire Canada and Qu&eacute;bec law jurisdictions
      </h2>
      <p className="subhead text-[13px]">
        Cross-referencing the contract against federal statutes, provincial
        civil codes, and sector regulators.
      </p>
      <div
        className="card card-tonal w-full px-5 py-4 text-left font-mono text-[12px]"
        style={{ minHeight: 200 }}
      >
        {SCAN_LINES.slice(0, tick).map((line, i) => (
          <p
            key={line}
            className="flex items-center gap-2 py-0.5"
            style={{ color: done[i] ? "var(--green-deep, #185538)" : "var(--ink)" }}
          >
            <span
              className="inline-block w-3 text-center"
              style={{
                color: done[i] ? "var(--green)" : "var(--ink)",
              }}
            >
              {done[i] ? "\u2713" : ">"}
            </span>
            <span className="flex-1">{line}</span>
            {i === tick - 1 && !done[i] ? (
              <span className="spinner" style={{ width: 10, height: 10 }} />
            ) : null}
          </p>
        ))}
        {tick === SCAN_LINES.length ? (
          <p
            className="mt-2 fade-in"
            style={{ color: "var(--green-deep, #185538)" }}
          >
            &gt; compiling dossier&hellip;
          </p>
        ) : null}
      </div>
    </div>
  );
}

function severityTone(s: LawViolation["severity"]): {
  bar: string;
  label: string;
  pillBg: string;
  pillFg: string;
} {
  if (s === "high") {
    return {
      bar: "var(--negative)",
      label: "Tier 1 \u00b7 High",
      pillBg: "#fdecea",
      pillFg: "var(--negative)",
    };
  }
  if (s === "medium") {
    return {
      bar: "var(--warning)",
      label: "Tier 2 \u00b7 Medium",
      pillBg: "#fff4d6",
      pillFg: "var(--warning)",
    };
  }
  return {
    bar: "var(--ink-soft)",
    label: "Tier 3 \u00b7 Low",
    pillBg: "var(--accent-soft)",
    pillFg: "var(--ink-soft)",
  };
}

/**
 * Bespoke "case dossier" entry for a single violation. Numbered, framed by
 * a thin severity bar on the very left, with the headline + blurb streamed
 * in via a fast typewriter so it reads as it lands.
 */
function ViolationDossier({
  v,
  showFr,
  index,
  total,
}: {
  v: LawViolation;
  showFr: boolean;
  index: number;
  total: number;
}) {
  const tone = severityTone(v.severity);
  const headline = `${v.shortName}  \u2014  ${showFr ? v.fullNameFr : v.fullName}`;
  const blurb = showFr ? v.blurbFr : v.blurb;
  const isLast = index === total - 1;

  // Stagger the headline -> blurb stream so every card feels generated.
  const headStartMs = 120 + index * 220;
  const blurbDelay = 90 + headline.length * 14; // start after headline finishes
  return (
    <article
      className="fade-in"
      style={{
        animationDelay: `${index * 60}ms`,
        position: "relative",
        padding: "26px 0 26px 26px",
        borderBottom: isLast ? "none" : "1px solid var(--line)",
      }}
    >
      {/* severity rail */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 26,
          bottom: 26,
          left: 0,
          width: 3,
          background: tone.bar,
          borderRadius: 2,
        }}
      />
      <div className="flex items-baseline gap-3">
        <span
          className="font-mono tabular-nums"
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            color: "var(--muted)",
          }}
        >
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span
          className="rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ background: tone.pillBg, color: tone.pillFg }}
        >
          {tone.label}
        </span>
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ color: "var(--ink-soft)" }}
        >
          {v.jurisdiction}
        </span>
      </div>
      <h3
        className="mt-3 text-[18px] font-semibold leading-snug tracking-tight"
        style={{ color: "var(--ink)" }}
      >
        <Typewriter text={headline} startMs={headStartMs} cps={120} cursor />
      </h3>
      <p
        className="mt-2 text-[13.5px] leading-relaxed"
        style={{ color: "var(--ink-soft)", maxWidth: 760 }}
      >
        <Typewriter
          text={blurb}
          startMs={headStartMs + blurbDelay}
          cps={220}
        />
      </p>
      {v.citation ? (
        <p
          className="mt-3 inline-flex items-center gap-2 text-[11px] font-mono"
          style={{ color: "var(--muted)" }}
        >
          <span
            className="inline-block h-px w-6"
            style={{ background: "var(--line-strong)" }}
          />
          <span style={{ color: "var(--ink-soft)" }}>citation:</span>
          <span style={{ color: "var(--ink)" }}>{v.citation}</span>
        </p>
      ) : null}
    </article>
  );
}

