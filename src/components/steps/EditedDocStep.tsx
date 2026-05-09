"use client";

import { useEffect, useMemo, useState } from "react";
import { useWizard } from "@/components/wizard/state";
import { getAgent } from "@/lib/agents";
import { getScenario } from "@/lib/scenarios";
import { redactToHtml } from "@/lib/redact";
import type { DocumentEdit } from "@/lib/types";

export function EditedDocStep() {
  const { state, dispatch } = useWizard();
  const scenario = state.scenarioId ? getScenario(state.scenarioId) : null;
  const [edits, setEdits] = useState<DocumentEdit[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redactOn, setRedactOn] = useState(true);
  const [extraNamesText, setExtraNamesText] = useState(
    (state.redactionNames.length > 0
      ? state.redactionNames
      : scenario?.sensitiveNames ?? []
    ).join(", "),
  );

  useEffect(() => {
    if (!state.scenarioId) return;
    setBusy(true);
    setError(null);
    void fetch("/api/document/edits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        scenarioId: state.scenarioId,
        path: state.decisionPath,
      }),
    })
      .then(async (r) => {
        const j = (await r.json()) as
          | { ok: true; data: { edits: DocumentEdit[] } }
          | { ok: false; error: { message: string } };
        if (!j.ok) throw new Error(j.error.message);
        setEdits(j.data.edits);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setBusy(false));
  }, [state.scenarioId, state.decisionPath]);

  const extraNames = useMemo(
    () => extraNamesText.split(",").map((s) => s.trim()).filter(Boolean),
    [extraNamesText],
  );

  if (!scenario) return <p className="muted">No scenario loaded.</p>;

  const editsByPara = new Map<number, DocumentEdit>();
  for (const e of edits) editsByPara.set(e.paragraphId, e);

  const finalParagraphs = scenario.paragraphs.map((p) => {
    const e = editsByPara.get(p.id);
    const enText = e ? e.replacementEn : p.en;
    const frText = e ? e.replacementFr : p.fr;
    return {
      id: p.id,
      text: state.locale === "fr" ? frText : enText,
      original: state.locale === "fr" ? p.fr : p.en,
      edited: !!e,
      sensitive: e?.sensitive ?? false,
      isSig: !!p.isSignatureBlock,
      party: p.party,
    };
  });

  const summaryItems = state.decisionTree.filter((n) => state.decisionPath.includes(n.id));

  function renderRedactable(text: string): { __html: string } {
    if (redactOn) {
      return { __html: redactToHtml(text, extraNames).html };
    }
    return {
      __html: text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;"),
    };
  }

  function maybeRedact(s: string): string {
    if (!redactOn) return s;
    // Plain-text version for the summary panel; still strips emails/etc.
    // The HTML render uses redactToHtml directly.
    let out = s;
    for (const n of extraNames) {
      const re = new RegExp(`\\b${escapeRegExp(n)}\\b`, "gi");
      out = out.replace(re, "■■■■■■");
    }
    return out;
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3 fade-in">
        <div>
          <span
            className="inline-block rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{
              borderColor: "var(--green-line, #b9d6c4)",
              color: "var(--green-deep, #185538)",
              background: "var(--green-soft, #e7f1ea)",
            }}
          >
            Step &middot; Edited Doc
          </span>
          <h2 className="mt-2 text-[24px] font-semibold tracking-tight">Edited contract + summary</h2>
          <p className="subhead text-[13px]">
            {scenario.headline}, {edits.length} edit{edits.length === 1 ? "" : "s"} applied,
            {state.signatures.length}/{scenario.paragraphs.filter((p) => p.isSignatureBlock).length} signatures captured.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="muted text-[12px]">Display:</span>
          <div
            className="flex overflow-hidden rounded-full border"
            style={{ borderColor: "var(--line-strong)" }}
          >
            {(["en", "fr"] as const).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => dispatch({ type: "SET_LOCALE", locale: loc })}
                className="px-3 py-1 text-[12px] font-medium"
                style={{
                  background: state.locale === loc ? "var(--ink)" : "white",
                  color: state.locale === loc ? "white" : "var(--ink)",
                }}
              >
                {loc.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="card flex flex-wrap items-center gap-3 px-5 py-3">
        <label className="flex cursor-pointer items-center gap-2 text-[13px]">
          <input type="checkbox" checked={redactOn} onChange={(e) => setRedactOn(e.target.checked)} />
          Redact personal / sensitive info
        </label>
        <span className="muted text-[12px]">
          When ON, sensitive substrings render as opaque black bars and flagged paragraphs are fully blacked out.
        </span>
      </div>

      <div className="card px-5 py-3">
        <p className="label">Extra names to redact</p>
        <input
          className="input mt-2"
          value={extraNamesText}
          onChange={(e) => setExtraNamesText(e.target.value)}
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="muted text-[11px]">Suggested:</span>
          {scenario.sensitiveNames.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() =>
                setExtraNamesText((s) =>
                  s
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean)
                    .concat(n)
                    .filter((v, i, arr) => arr.indexOf(v) === i)
                    .join(", "),
                )
              }
              className="rounded-full border px-2 py-0.5 text-[11px]"
              style={{ borderColor: "var(--line-strong)", background: "white" }}
            >
              + {n}
            </button>
          ))}
        </div>
      </div>

      {busy ? (
        <p className="flex items-center gap-2 text-[13px]">
          <span className="spinner" /> Applying edits…
        </p>
      ) : error ? (
        <p className="text-[13px]" style={{ color: "var(--negative)" }}>{error}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="card scroll-y px-6 py-5" style={{ maxHeight: 540 }}>
          {finalParagraphs.map((p) => (
            <div key={p.id} className="mb-5">
              {p.edited ? (
                <details className="mb-1">
                  <summary
                    className="cursor-pointer text-[11px] font-medium"
                    style={{ color: "var(--positive)" }}
                  >
                    ✎ EDITED, view original
                  </summary>
                  <p
                    className="mt-2 text-[12px]"
                    style={{
                      color: "var(--ink-soft)",
                      textDecoration: "line-through",
                    }}
                  >
                    {p.original}
                  </p>
                </details>
              ) : null}
              {redactOn && p.sensitive ? (
                <p className="redact-block text-[14px]">{p.text}</p>
              ) : (
                <p
                  className="text-[14px] leading-relaxed"
                  style={{
                    color: "var(--ink)",
                    background: p.edited ? "var(--accent-soft)" : "transparent",
                    padding: p.edited ? "8px 10px" : 0,
                    borderRadius: 6,
                    whiteSpace: "pre-wrap",
                  }}
                  dangerouslySetInnerHTML={renderRedactable(p.text)}
                />
              )}
              {p.isSig ? (
                <SignatureView state={state} paragraphId={p.id} party={p.party} />
              ) : null}
            </div>
          ))}
        </div>

        <aside className="card flex flex-col gap-3 px-5 py-5">
          <p className="label">What you decided</p>
          {summaryItems.length === 0 ? (
            <p className="muted text-[12px]">
              No decisions taken, original contract shown unchanged.
            </p>
          ) : (
            <ol className="space-y-3 text-[12px]">
              {summaryItems.map((n, i) => (
                <li
                  key={n.id}
                  className="rounded-md border px-3 py-2"
                  style={{
                    borderColor: n.cumulativeScore <= -3 ? "var(--negative)" : "var(--line-strong)",
                    background: n.cumulativeScore <= -3 ? "#fef5f4" : "white",
                  }}
                >
                  <p className="text-[11px] muted">
                    Step {i + 1} · Δ {n.delta > 0 ? "+" : ""}{n.delta} · cum {n.cumulativeScore.toFixed(1)}
                  </p>
                  {redactOn ? (
                    <p
                      className="mt-1 text-[13px] font-medium"
                      dangerouslySetInnerHTML={{
                        __html: redactToHtml(n.label, extraNames).html,
                      }}
                    />
                  ) : (
                    <p className="mt-1 text-[13px] font-medium">{n.label}</p>
                  )}
                  {redactOn ? (
                    <p
                      className="muted mt-1 text-[11px]"
                      dangerouslySetInnerHTML={{
                        __html: redactToHtml(n.detail, extraNames).html,
                      }}
                    />
                  ) : (
                    <p className="muted mt-1 text-[11px]">{n.detail}</p>
                  )}
                </li>
              ))}
            </ol>
          )}

          <div className="border-t pt-3" style={{ borderColor: "var(--line)" }}>
            <p className="label">Final win bar</p>
            <p
              className="mt-1 text-[24px] font-semibold tabular-nums"
              style={{ color: state.score >= 0 ? "var(--positive)" : "var(--negative)" }}
            >
              {state.score > 0 ? "+" : ""}
              {state.score.toFixed(1)} / ±10
            </p>
          </div>

          <div className="border-t pt-3" style={{ borderColor: "var(--line)" }}>
            <p className="label">Council voices</p>
            <ul className="mt-2 space-y-1 text-[12px]">
              {state.debate.slice(-3).map((t) => {
                const a = getAgent(t.agentId);
                return (
                  <li key={t.id} className="muted">
                    <strong style={{ color: "var(--ink)" }}>{a?.name}</strong>:{" "}
                    {redactOn ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: redactToHtml(t.text, extraNames).html,
                        }}
                      />
                    ) : (
                      maybeRedact(t.text)
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>

      <div className="mt-2 flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: "BACK" })}>
          &larr; Back
        </button>
        <button type="button" className="btn btn-accent" onClick={() => dispatch({ type: "GOTO", step: "done" })}>
          Continue &rarr; Wrap up
        </button>
      </div>
    </div>
  );
}

function SignatureView({
  state,
  paragraphId,
  party,
}: {
  state: ReturnType<typeof useWizard>["state"];
  paragraphId: number;
  party?: "vendor" | "client";
}) {
  const sig = state.signatures.find((s) => s.paragraphIndex === paragraphId);
  if (!sig) {
    return (
      <p className="muted mt-2 text-[11px]">
        ✘ no signature captured for this {party ?? "party"} block
      </p>
    );
  }
  return (
    <div
      className="mt-2 inline-block rounded-md border bg-white px-3 py-2"
      style={{ borderColor: "var(--line-strong)" }}
    >
      <p className="muted text-[10px] uppercase tracking-widest">
        signed {party ?? sig.party} · {new Date(sig.signedAt).toLocaleString()}
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sig.dataUrl}
        alt={`${party ?? sig.party} signature`}
        style={{ height: 56, width: "auto", maxWidth: 280 }}
      />
    </div>
  );
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
