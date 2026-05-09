"use client";

import { useEffect, useMemo, useState } from "react";
import { useWizard } from "@/components/wizard/state";
import { getAgent } from "@/lib/agents";
import type { ContextAnswer } from "@/lib/types";

interface AgentHint {
  headline: string;
  detail: string;
  suggestedAnswer: string;
}

export function ContextStep() {
  const { state, dispatch } = useWizard();
  const order = state.workflow;
  const [idx, setIdx] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [hint, setHint] = useState<AgentHint | null>(null);
  const [answers, setAnswers] = useState<string[]>(["", ""]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hintOpen, setHintOpen] = useState(true);

  const current = order[idx];
  const agent = useMemo(() => (current ? getAgent(current) : undefined), [current]);

  useEffect(() => {
    if (!agent || !state.scenarioId) return;
    setBusy(true);
    setError(null);
    setQuestions([]);
    setHint(null);
    setAnswers(["", ""]);
    setHintOpen(true);
    void fetch("/api/agents/questions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scenarioId: state.scenarioId, agentId: agent.id }),
    })
      .then(async (r) => {
        const j = (await r.json()) as
          | { ok: true; data: { questions: string[]; hint: AgentHint } }
          | { ok: false; error: { message: string } };
        if (!j.ok) throw new Error(j.error.message);
        setQuestions(j.data.questions);
        setHint(j.data.hint);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setBusy(false));
  }, [agent, state.scenarioId]);

  if (order.length === 0) {
    return <p className="muted">Add at least one agent to your workflow first.</p>;
  }

  if (!agent) return null;

  function applyHintToAnswer() {
    if (!hint) return;
    setAnswers((arr) => {
      const cp = [...arr];
      cp[0] = hint.suggestedAnswer;
      return cp;
    });
  }

  function saveAndAdvance(skip: boolean) {
    const newAnswers: ContextAnswer[] = [];
    if (!skip) {
      questions.forEach((q, i) => {
        const a = answers[i]?.trim();
        if (a) newAnswers.push({ agentId: agent!.id, question: q, answer: a });
      });
    }
    const merged = state.context
      .filter((c) => c.agentId !== agent!.id)
      .concat(newAnswers);
    dispatch({ type: "SET_CONTEXT", context: merged });
    if (idx < order.length - 1) {
      setIdx(idx + 1);
    } else {
      dispatch({ type: "GOTO", step: "warroom" });
    }
  }

  return (
    <div className="relative flex flex-col gap-5">
      <header>
        <h2 className="text-[22px] font-semibold tracking-tight">Brief the agents</h2>
        <p className="muted text-[13px]">
          Each agent asks for what they need. Use the hint panel on the right —
          you can drop our suggestion straight into the textbox.
        </p>
      </header>

      <ProgressChips order={order} idx={idx} />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card grid gap-3 px-5 py-5 md:grid-cols-[180px_1fr]">
          <div>
            <p className="text-[18px] font-semibold">{agent.name}</p>
            <p className="muted text-[12px]">{agent.role}</p>
            <p className="mt-3 text-[13px]">{agent.blurb}</p>
            <p className="muted mt-2 text-[12px]">
              <strong>Specialty:</strong> {agent.speciality}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {busy ? (
              <p className="flex items-center gap-2 text-[13px]">
                <span className="spinner" /> Thinking…
              </p>
            ) : error ? (
              <p className="text-[13px]" style={{ color: "var(--negative)" }}>{error}</p>
            ) : (
              questions.map((q, i) => (
                <label key={`${current}-${i}`} className="block">
                  <span className="label">Q{i + 1}</span>
                  <p className="mt-1 text-[13px]">{q}</p>
                  <textarea
                    className="textarea mt-2"
                    rows={i === 0 ? 4 : 2}
                    value={answers[i] ?? ""}
                    onChange={(e) => {
                      const cp = [...answers];
                      cp[i] = e.target.value;
                      setAnswers(cp);
                    }}
                  />
                </label>
              ))
            )}
          </div>
        </div>

        {hint ? (
          <HintPanel
            hint={hint}
            agentName={agent.name}
            open={hintOpen}
            onToggle={() => setHintOpen((o) => !o)}
            onApply={applyHintToAnswer}
          />
        ) : (
          <div />
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => (idx === 0 ? dispatch({ type: "BACK" }) : setIdx(idx - 1))}
        >
          ← {idx === 0 ? "Back to goal" : `Back to ${getAgent(order[idx - 1])?.name}`}
        </button>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary" onClick={() => saveAndAdvance(true)}>
            Skip {agent.name}
          </button>
          <button type="button" className="btn" onClick={() => saveAndAdvance(false)}>
            {idx < order.length - 1 ? "Save & next agent →" : "Save & open War Room →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressChips({ order, idx }: { order: string[]; idx: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[12px]">
      {order.map((id, i) => {
        const a = getAgent(id);
        const done = i < idx;
        const active = i === idx;
        return (
          <span
            key={id}
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5"
            style={{
              background: active ? "var(--ink)" : done ? "white" : "transparent",
              color: active ? "white" : "var(--ink)",
              borderColor: active ? "var(--ink)" : "var(--line-strong)",
            }}
          >
            {done ? "✓ " : ""}
            {a?.name}
          </span>
        );
      })}
    </div>
  );
}

function HintPanel({
  hint,
  agentName,
  open,
  onToggle,
  onApply,
}: {
  hint: AgentHint;
  agentName: string;
  open: boolean;
  onToggle: () => void;
  onApply: () => void;
}) {
  return (
    <aside
      className="card sticky top-2 h-fit transition-all"
      style={{
        borderColor: open ? "var(--ink)" : "var(--line-strong)",
        background: open ? "white" : "var(--accent-soft)",
        padding: open ? 18 : 12,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div>
          <p className="text-[11px] uppercase tracking-widest muted">Hint for {agentName}</p>
          <p className="mt-1 text-[14px] font-semibold">{hint.headline}</p>
        </div>
        <span className="muted text-[14px]">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <>
          <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            {hint.detail}
          </p>
          <div className="mt-4 rounded-md border p-3" style={{ borderColor: "var(--line)", background: "var(--accent-soft)" }}>
            <p className="text-[11px] uppercase tracking-widest muted">Suggested answer</p>
            <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--ink)" }}>
              {hint.suggestedAnswer}
            </p>
            <button type="button" className="btn mt-3" style={{ height: 32, padding: "0 14px" }} onClick={onApply}>
              Say this to {agentName} →
            </button>
          </div>
        </>
      ) : null}
    </aside>
  );
}
