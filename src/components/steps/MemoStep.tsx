"use client";

import { useMemo, useState } from "react";
import { useWizard } from "@/components/wizard/state";
import { getAgent } from "@/lib/agents";
import { getScenario } from "@/lib/scenarios";
import { redact } from "@/lib/redact";

function buildHighlights(state: ReturnType<typeof useWizard>["state"]): string[] {
  const out: string[] = [];
  out.push(`Final win bar: ${state.score.toFixed(1)} / ±10.`);
  if (state.esig) {
    out.push(
      state.esig.qcAvailable
        ? "E-sig: available in Quebec under CQLR c. C-1.1 / UECA."
        : "E-sig: restricted — wet-ink or notary may be required.",
    );
  }
  if (state.bookingFromTranslate?.booked) {
    out.push("Translation review meeting booked because the doc was machine-translated.");
  }
  if (state.meeting?.booked) {
    out.push(`Internal review meeting booked for ${new Date(state.meeting.whenIso!).toLocaleString()}.`);
  }
  for (const t of state.debate.slice(-3)) {
    const a = getAgent(t.agentId);
    out.push(`${a?.name ?? t.agentId}: ${t.text}`);
  }
  return out;
}

export function MemoStep() {
  const { state, dispatch } = useWizard();
  const scenario = state.scenarioId ? getScenario(state.scenarioId) : null;
  const [needed, setNeeded] = useState<boolean | null>(state.memoNeeded);
  const [redactOn, setRedactOn] = useState(true);
  const [extraNamesText, setExtraNamesText] = useState(
    (state.redactionNames.length > 0
      ? state.redactionNames
      : scenario?.sensitiveNames ?? []
    ).join(", "),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(state.memo?.pdfUrl ?? null);
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(state.memo?.postedToSlack ?? false);

  const extraNames = useMemo(
    () => extraNamesText.split(",").map((s) => s.trim()).filter(Boolean),
    [extraNamesText],
  );
  const highlights = useMemo(() => buildHighlights(state), [state]);
  const previewBody = useMemo(() => {
    const block = [
      `Goal: ${state.goal || "(not stated)"}`,
      "",
      `Decisions: ${state.decisionTree
        .filter((n) => state.decisionPath.includes(n.id))
        .map((d) => `${d.label} (${d.delta > 0 ? "+" : ""}${d.delta})`)
        .join(" → ") || "(none)"}`,
      "",
      "Highlights:",
      ...highlights.map((h) => `• ${h}`),
    ].join("\n");
    return redactOn ? redact(block, extraNames).text : block;
  }, [state, highlights, redactOn, extraNames]);

  function setAnswer(v: boolean) {
    setNeeded(v);
    dispatch({ type: "SET_MEMO_NEEDED", v });
  }

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/memo/pdf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: scenario?.summaryTitle ?? `Gambit memo — ${state.doc?.filename ?? "contract"}`,
          goal: state.goal,
          finalScore: state.score,
          decisions: state.decisionTree
            .filter((n) => state.decisionPath.includes(n.id))
            .map((d) => ({ label: d.label, delta: d.delta })),
          highlights,
          redact: redactOn,
          extraNames,
        }),
      });
      if (!r.ok) {
        const t = await r.text();
        throw new Error(`memo: ${r.status} ${t.slice(0, 120)}`);
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      dispatch({
        type: "SET_MEMO",
        memo: { pdfUrl: url, postedToSlack: posted, redacted: redactOn },
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function post() {
    setPosting(true);
    setError(null);
    try {
      const r = await fetch("/api/slack/post", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          memoTitle: scenario?.summaryTitle ?? `Gambit memo — ${state.doc?.filename ?? "contract"}`,
          text: previewBody,
        }),
      });
      const j = (await r.json()) as
        | { ok: true; data: { mode: string; postedAt: string } }
        | { ok: false; error: { message: string } };
      if (!j.ok) throw new Error(j.error.message);
      setPosted(true);
      dispatch({
        type: "SET_MEMO",
        memo: { pdfUrl: pdfUrl ?? "", postedToSlack: true, redacted: redactOn },
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h2 className="text-[22px] font-semibold tracking-tight">Need a workspace memo?</h2>
        <p className="muted text-[13px]">
          Generates a redacted PDF you can post to Slack with one click.
        </p>
      </header>

      {needed === null ? (
        <div className="flex gap-2">
          <button type="button" className="btn" onClick={() => setAnswer(true)}>Yes, build one</button>
          <button type="button" className="btn btn-secondary" onClick={() => setAnswer(false)}>No, skip</button>
        </div>
      ) : !needed ? (
        <p className="muted text-[13px]">Skipped memo.</p>
      ) : (
        <>
          <div className="card flex flex-wrap items-center gap-3 px-5 py-3">
            <label className="flex cursor-pointer items-center gap-2 text-[13px]">
              <input type="checkbox" checked={redactOn} onChange={(e) => setRedactOn(e.target.checked)} />
              Redact for Slack
            </label>
          </div>

          <div className="card px-5 py-3">
            <p className="label">Extra names to redact</p>
            <input
              className="input mt-2"
              value={extraNamesText}
              onChange={(e) => setExtraNamesText(e.target.value)}
            />
            {scenario ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="muted text-[11px]">Suggested:</span>
                {scenario.sensitiveNames.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() =>
                      setExtraNamesText((s) =>
                        s.split(",").map((x) => x.trim()).filter(Boolean).concat(n)
                          .filter((v, i, arr) => arr.indexOf(v) === i).join(", "),
                      )
                    }
                    className="rounded-full border px-2 py-0.5 text-[11px]"
                    style={{ borderColor: "var(--line-strong)", background: "white" }}
                  >
                    + {n}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <pre
            className="card scroll-y px-5 py-5 font-mono text-[12px]"
            style={{ maxHeight: 240, whiteSpace: "pre-wrap" }}
          >
            {previewBody}
          </pre>

          {error ? (
            <p className="text-[13px]" style={{ color: "var(--negative)" }}>{error}</p>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => void generate()}>
              {busy ? "Building PDF…" : pdfUrl ? "Rebuild PDF" : "Build PDF"}
            </button>
            {pdfUrl ? (
              <a className="btn btn-secondary" href={pdfUrl} download="gambit-memo.pdf">Download PDF</a>
            ) : null}
            <button type="button" className="btn" disabled={posting} onClick={() => void post()}>
              {posting ? "Posting…" : posted ? "✓ Posted to Slack" : "Post to Slack"}
            </button>
          </div>
        </>
      )}

      <div className="flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: "BACK" })}>← Back</button>
        <button type="button" className="btn" onClick={() => dispatch({ type: "GOTO", step: "edited" })}>
          Continue → See edited contract
        </button>
      </div>
    </div>
  );
}
