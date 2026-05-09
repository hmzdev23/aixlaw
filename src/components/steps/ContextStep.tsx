"use client";

import { useEffect, useMemo, useState } from "react";
import { useWizard } from "@/components/wizard/state";
import { getAgent } from "@/lib/agents";
import type { ContextAnswer } from "@/lib/types";

export function ContextStep() {
  const { state, dispatch } = useWizard();
  const order = state.workflow;
  const [idx, setIdx] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>(["", ""]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = order[idx];
  const agent = useMemo(() => (current ? getAgent(current) : undefined), [current]);

  useEffect(() => {
    if (!agent || !state.doc) return;
    setBusy(true);
    setError(null);
    setQuestions([]);
    setAnswers(["", ""]);
    void fetch("/api/agents/questions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        agentId: agent.id,
        goal: state.goal,
        docExcerpt: state.doc.text.slice(0, 5000),
      }),
    })
      .then(async (r) => {
        const j = (await r.json()) as
          | { ok: true; data: { questions: string[] } }
          | { ok: false; error: { message: string } };
        if (!j.ok) throw new Error(j.error.message);
        setQuestions(j.data.questions);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setBusy(false));
  }, [agent, state.goal, state.doc]);

  if (order.length === 0) {
    return (
      <p className="muted">
        Add at least one agent to your workflow before briefing them.
      </p>
    );
  }

  if (!agent) return null;

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
      <header>
        <h2 className="text-[22px] font-semibold tracking-tight">Brief the agents</h2>
        <p className="muted text-[13px]">
          Each agent asks the user for what they need. Answer briefly — they can
          fill in the rest from the document.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 text-[12px]">
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
              {done ? "✓ " : ""}{a?.name}
            </span>
          );
        })}
      </div>

      <div className="card grid gap-3 px-5 py-5 md:grid-cols-[200px_1fr]">
        <div>
          <p className="text-[18px] font-semibold">{agent.name}</p>
          <p className="muted text-[12px]">{agent.role}</p>
          <p className="mt-3 text-[13px]">{agent.blurb}</p>
          <p className="muted mt-2 text-[12px]"><strong>Specialty:</strong> {agent.speciality}</p>
        </div>
        <div className="flex flex-col gap-3">
          {busy ? (
            <p className="flex items-center gap-2 text-[13px]"><span className="spinner" /> Thinking…</p>
          ) : error ? (
            <p className="text-[13px]" style={{ color: "var(--negative)" }}>{error}</p>
          ) : questions.length === 0 ? (
            <p className="muted text-[13px]">No questions needed. You can move on.</p>
          ) : (
            questions.map((q, i) => (
              <label key={`${current}-${i}`} className="block">
                <span className="label">Q{i + 1}</span>
                <p className="mt-1 text-[13px]">{q}</p>
                <textarea
                  className="textarea mt-2"
                  rows={2}
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

      <div className="flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: "BACK" })}>← Back to goal</button>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary" onClick={() => saveAndAdvance(true)}>
            Skip {agent.name}
          </button>
          <button type="button" className="btn" onClick={() => saveAndAdvance(false)}>
            {idx < order.length - 1 ? `Save & next agent →` : "Save & open War Room →"}
          </button>
        </div>
      </div>
    </div>
  );
}
