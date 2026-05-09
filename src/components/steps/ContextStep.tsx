"use client";

import { useEffect, useMemo, useState } from "react";
import { useWizard } from "@/components/wizard/state";
import { getAgent } from "@/lib/agents";
import type { ContextAnswer } from "@/lib/types";
import type { ScenarioHint } from "@/lib/scenarios/types";

interface QuestionsPayload {
  questions: string[];
  hints: ScenarioHint[];
}

export function ContextStep() {
  const { state, dispatch } = useWizard();
  const order = state.workflow;
  const [idx, setIdx] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [hints, setHints] = useState<ScenarioHint[]>([]);
  const [hintsRevealed, setHintsRevealed] = useState(false);
  const [answers, setAnswers] = useState<string[]>(["", ""]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = order[idx];
  const agent = useMemo(() => (current ? getAgent(current) : undefined), [current]);

  useEffect(() => {
    if (!agent || !state.scenarioId) return;
    setBusy(true);
    setError(null);
    setQuestions([]);
    setHints([]);
    setAnswers(["", ""]);
    setHintsRevealed(false);

    let alive = true;
    void fetch("/api/agents/questions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scenarioId: state.scenarioId, agentId: agent.id }),
    })
      .then(async (r) => {
        const j = (await r.json()) as
          | { ok: true; data: QuestionsPayload }
          | { ok: false; error: { message: string } };
        if (!j.ok) throw new Error(j.error.message);
        if (!alive) return;
        setQuestions(j.data.questions);
        setHints(j.data.hints);
        // Reveal hints after a short delay so it feels like they're being generated.
        setTimeout(() => {
          if (alive) setHintsRevealed(true);
        }, 1300);
      })
      .catch((e) => {
        if (alive) setError((e as Error).message);
      })
      .finally(() => {
        if (alive) setBusy(false);
      });

    return () => {
      alive = false;
    };
  }, [agent, state.scenarioId]);

  if (order.length === 0) {
    return <p className="muted">Add at least one agent to your workflow first.</p>;
  }

  if (!agent) return null;

  function applyHintToAnswer(qIndex: number, suggested: string) {
    setAnswers((arr) => {
      const cp = [...arr];
      cp[qIndex] = suggested;
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
    <div className="flex flex-col gap-5">
      <header className="fade-in">
        <span
          className="inline-block rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{
            borderColor: "var(--green-line, #b9d6c4)",
            color: "var(--green-deep, #185538)",
            background: "var(--green-soft, #e7f1ea)",
          }}
        >
          Step &middot; Context
        </span>
        <h2 className="mt-2 text-[24px] font-semibold tracking-tight">Brief the agents</h2>
        <p className="subhead text-[13px]">
          Each agent asks for what they need. Use the hint cards on the right;
          you can drop our suggestion straight into the textbox.
        </p>
      </header>

      <ProgressChips order={order} idx={idx} />

      <div className="card grid gap-3 px-5 py-5 md:grid-cols-[200px_1fr]">
        <div>
          <p className="text-[18px] font-semibold">{agent.name}</p>
          <p className="muted text-[12px]">{agent.role}</p>
          <p className="mt-3 text-[13px]">{agent.blurb}</p>
          <p className="muted mt-2 text-[12px]">
            <strong>Specialty:</strong> {agent.speciality}
          </p>
        </div>
        <div className="flex flex-col gap-5">
          {busy ? (
            <p className="flex items-center gap-2 text-[13px]">
              <span className="spinner" /> Loading {agent.name}&apos;s questions…
            </p>
          ) : error ? (
            <p className="text-[13px]" style={{ color: "var(--negative)" }}>{error}</p>
          ) : (
            questions.map((q, i) => (
              <div key={`${current}-${i}`} className="grid gap-3 md:grid-cols-[1fr_280px]">
                <div>
                  <p className="label">Q{i + 1}</p>
                  <p className="mt-1 text-[13px]">{q}</p>
                  <textarea
                    className="textarea mt-2"
                    rows={3}
                    value={answers[i] ?? ""}
                    onChange={(e) => {
                      const cp = [...answers];
                      cp[i] = e.target.value;
                      setAnswers(cp);
                    }}
                  />
                </div>
                <HintCard
                  agentName={agent.name}
                  qIndex={i}
                  hint={hints[i]}
                  visible={hintsRevealed}
                  onApply={(text) => applyHintToAnswer(i, text)}
                />
              </div>
            ))
          )}
        </div>
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
          <button type="button" className="btn btn-accent" onClick={() => saveAndAdvance(false)}>
            {idx < order.length - 1 ? "Save & next agent \u2192" : "Save & open War Room \u2192"}
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
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 transition"
            style={{
              background: active
                ? "var(--green)"
                : done
                  ? "var(--green-soft, #e7f1ea)"
                  : "transparent",
              color: active
                ? "white"
                : done
                  ? "var(--green-deep, #185538)"
                  : "var(--ink)",
              borderColor: active
                ? "var(--green)"
                : done
                  ? "var(--green)"
                  : "var(--line-strong)",
              fontWeight: active ? 600 : 500,
            }}
          >
            {done ? "\u2713 " : ""}
            {a?.name}
          </span>
        );
      })}
    </div>
  );
}

function HintCard({
  agentName,
  qIndex,
  hint,
  visible,
  onApply,
}: {
  agentName: string;
  qIndex: number;
  hint: ScenarioHint | undefined;
  visible: boolean;
  onApply: (text: string) => void;
}) {
  if (!visible || !hint) {
    return (
      <aside className="rounded-md border px-3 py-3" style={{ borderColor: "var(--line-strong)", background: "var(--accent-soft)" }}>
        <p className="text-[11px] uppercase tracking-widest muted">Hint for Q{qIndex + 1}</p>
        <p className="mt-2 flex items-center gap-2 text-[12px] muted">
          <span className="spinner" /> Drafting hint…
        </p>
      </aside>
    );
  }
  return (
    <aside
      className={`fade-in stagger-${(qIndex % 5) + 1} rounded-lg border px-3 py-3 lift-on-hover`}
      style={{
        borderColor: "var(--green-line, #b9d6c4)",
        background: "linear-gradient(180deg, var(--green-soft, #e7f1ea) 0%, white 80%)",
        borderLeft: "3px solid var(--green)",
      }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: "var(--green-deep, #185538)" }}
      >
        Hint for Q{qIndex + 1}
      </p>
      <p className="mt-1 text-[13px] font-semibold">{hint.headline}</p>
      <p
        className="mt-2 text-[12px] leading-relaxed"
        style={{ color: "var(--ink-soft)" }}
      >
        {hint.detail}
      </p>
      <div
        className="mt-3 rounded-md border p-2"
        style={{ borderColor: "var(--line-strong)", background: "white" }}
      >
        <p className="text-[10px] uppercase tracking-widest muted">Suggested answer</p>
        <p className="mt-1 text-[12px] leading-relaxed">{hint.suggestedAnswer}</p>
        <button
          type="button"
          className="btn btn-accent mt-2"
          style={{ height: 28, padding: "0 12px", fontSize: 12 }}
          onClick={() => onApply(hint.suggestedAnswer)}
        >
          Say this to {agentName} &rarr;
        </button>
      </div>
    </aside>
  );
}
