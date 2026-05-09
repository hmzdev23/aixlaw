"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWizard } from "@/components/wizard/state";
import { getAgent } from "@/lib/agents";
import type { DebateTurn, DecisionOption } from "@/lib/types";

export function WarRoomStep() {
  const { state, dispatch } = useWizard();
  const [busyDebate, setBusyDebate] = useState(false);
  const [busyOptions, setBusyOptions] = useState(false);
  const [options, setOptions] = useState<DecisionOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const ranOnce = useRef(false);

  // Auto-start the debate the first time we land here.
  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;
    void runDebate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runDebate() {
    if (!state.doc) return;
    setBusyDebate(true);
    setError(null);
    try {
      const r = await fetch("/api/agents/debate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          goal: state.goal,
          workflow: state.workflow,
          context: state.context,
          doc: state.doc.text.slice(0, 12000),
        }),
      });
      const j = (await r.json()) as
        | { ok: true; data: { turns: DebateTurn[] } }
        | { ok: false; error: { message: string } };
      if (!j.ok) throw new Error(j.error.message);
      // Replay turns one by one with a small visual delay
      for (const t of j.data.turns) {
        await sleep(300);
        dispatch({ type: "ADD_TURN", turn: t });
        dispatch({ type: "ADJUST_SCORE", delta: t.delta });
      }
      await loadOptions();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyDebate(false);
    }
  }

  async function loadOptions(parentLabel?: string) {
    setBusyOptions(true);
    try {
      const r = await fetch("/api/agents/decide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          goal: state.goal,
          lastTurns: state.debate.slice(-state.workflow.length * 2),
          parentLabel,
        }),
      });
      const j = (await r.json()) as
        | { ok: true; data: { options: DecisionOption[] } }
        | { ok: false; error: { message: string } };
      if (!j.ok) throw new Error(j.error.message);
      setOptions(j.data.options);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyOptions(false);
    }
  }

  function chooseOption(opt: DecisionOption) {
    const parent = state.decisions[state.decisions.length - 1] ?? null;
    const cumulative = (parent?.cumulativeScore ?? state.score) + opt.delta;
    dispatch({
      type: "ADD_DECISION",
      node: {
        id: `dec_${Date.now()}`,
        parentId: parent?.id ?? null,
        label: opt.label,
        delta: opt.delta,
        cumulativeScore: cumulative,
        chosen: true,
      },
    });
    dispatch({ type: "ADJUST_SCORE", delta: opt.delta });
    void loadOptions(opt.label);
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-semibold tracking-tight">War Room</h2>
          <p className="muted text-[13px]">
            Goal: <em>&ldquo;{state.goal}&rdquo;</em>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <WinBar score={state.score} />
          <button
            type="button"
            className="btn btn-secondary"
            disabled={busyDebate}
            onClick={() => void runDebate()}
          >
            {busyDebate ? "Running…" : "Run another round"}
          </button>
        </div>
      </header>

      {error ? (
        <p className="text-[13px]" style={{ color: "var(--negative)" }}>{error}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <ChatPane turns={state.debate} busy={busyDebate} />
        <DecisionPane
          options={options}
          busy={busyOptions}
          onChoose={chooseOption}
          decisions={state.decisions}
        />
      </div>

      <DecisionTree decisions={state.decisions} />

      <Footer
        onBack={() => dispatch({ type: "BACK" })}
        onNext={() => dispatch({ type: "GOTO", step: "export" })}
        disabled={state.debate.length === 0}
      />
    </div>
  );
}

function WinBar({ score }: { score: number }) {
  const pct = ((score + 10) / 20) * 100;
  const positive = score >= 0;
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="muted text-[11px] uppercase tracking-widest">Win bar</span>
      <div
        className="relative h-2 w-[160px] overflow-hidden rounded-full"
        style={{ background: "var(--accent-soft)" }}
      >
        <div
          className="absolute top-0 h-full transition-all"
          style={{
            left: `${50}%`,
            width: `${Math.abs(pct - 50)}%`,
            transform: pct < 50 ? "translateX(-100%)" : "none",
            background: positive ? "var(--positive)" : "var(--negative)",
          }}
        />
        <div className="absolute left-1/2 top-0 h-full w-px" style={{ background: "var(--ink-soft)" }} />
      </div>
      <span
        className="text-[14px] font-semibold tabular-nums"
        style={{ color: positive ? "var(--positive)" : "var(--negative)" }}
      >
        {positive ? "+" : ""}
        {score.toFixed(1)}
      </span>
    </div>
  );
}

function ChatPane({ turns, busy }: { turns: DebateTurn[]; busy: boolean }) {
  return (
    <div className="card scroll-y px-5 py-5" style={{ height: 360 }}>
      {turns.length === 0 && !busy ? (
        <p className="muted text-[13px]">Click &ldquo;Run another round&rdquo; to start.</p>
      ) : null}
      <div className="flex flex-col gap-3">
        {turns.map((t) => {
          const a = getAgent(t.agentId);
          return (
            <div key={t.id} className="flex gap-3">
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-semibold"
                style={{ background: "var(--accent-soft)" }}
              >
                {a?.emoji ?? "?"}
              </span>
              <div className="flex-1">
                <p className="text-[13px]">
                  <strong className="font-semibold">{a?.name ?? t.agentId}</strong>
                  <span className="muted ml-1 text-[11px]">{a?.role}</span>
                  <span
                    className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums"
                    style={{
                      background:
                        t.delta > 0 ? "#eaf6ee" : t.delta < 0 ? "#fdecea" : "var(--accent-soft)",
                      color:
                        t.delta > 0 ? "var(--positive)" : t.delta < 0 ? "var(--negative)" : "var(--ink-soft)",
                    }}
                  >
                    {t.delta > 0 ? "+" : ""}{t.delta}
                  </span>
                </p>
                <p className="mt-1 text-[13px] leading-relaxed">{t.text}</p>
              </div>
            </div>
          );
        })}
        {busy ? (
          <p className="flex items-center gap-2 text-[13px] muted"><span className="spinner" /> agents thinking…</p>
        ) : null}
      </div>
    </div>
  );
}

function DecisionPane({
  options,
  busy,
  onChoose,
  decisions,
}: {
  options: DecisionOption[];
  busy: boolean;
  onChoose: (o: DecisionOption) => void;
  decisions: ReturnType<typeof useWizard>["state"]["decisions"];
}) {
  return (
    <div className="card flex flex-col gap-3 px-5 py-5">
      <p className="label">Decision options</p>
      {busy ? (
        <p className="flex items-center gap-2 text-[13px] muted"><span className="spinner" /> Drafting…</p>
      ) : options.length === 0 ? (
        <p className="muted text-[12px]">After the debate runs you&apos;ll see 3 options here.</p>
      ) : (
        options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChoose(o)}
            className="rounded-lg border px-3 py-3 text-left text-[13px] transition hover:bg-[var(--accent-soft)]"
            style={{ borderColor: "var(--line-strong)" }}
          >
            <p className="font-medium">{o.label}</p>
            <p className="muted mt-1 text-[12px]">{o.detail}</p>
            <p
              className="mt-2 text-[11px] font-semibold"
              style={{ color: o.delta > 0 ? "var(--positive)" : o.delta < 0 ? "var(--negative)" : "var(--ink-soft)" }}
            >
              Win bar {o.delta > 0 ? "+" : ""}
              {o.delta}
            </p>
          </button>
        ))
      )}
      {decisions.length > 0 ? (
        <p className="muted mt-2 text-[11px]">
          {decisions.length} decision{decisions.length === 1 ? "" : "s"} on the path.
        </p>
      ) : null}
    </div>
  );
}

function DecisionTree({
  decisions,
}: {
  decisions: ReturnType<typeof useWizard>["state"]["decisions"];
}) {
  const path = useMemo(() => decisions, [decisions]);
  if (path.length === 0) return null;
  return (
    <div className="card px-5 py-4">
      <p className="label">Decision tree</p>
      <ol className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
        <li className="rounded-full border px-2 py-0.5" style={{ borderColor: "var(--line-strong)", background: "white" }}>start</li>
        {path.map((n) => (
          <Crumb key={n.id} label={n.label} delta={n.delta} cumulative={n.cumulativeScore} />
        ))}
      </ol>
    </div>
  );
}

function Crumb({ label, delta, cumulative }: { label: string; delta: number; cumulative: number }) {
  return (
    <>
      <span className="muted">→</span>
      <li
        className="rounded-full border px-2 py-0.5"
        style={{
          borderColor: delta >= 0 ? "var(--positive)" : "var(--negative)",
          background: delta >= 0 ? "#eaf6ee" : "#fdecea",
          color: delta >= 0 ? "var(--positive)" : "var(--negative)",
        }}
        title={`cumulative ${cumulative}`}
      >
        {delta > 0 ? "+" : ""}{delta} · {label}
      </li>
    </>
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
        Continue → Export the chat
      </button>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
