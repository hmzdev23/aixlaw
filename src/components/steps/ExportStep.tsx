"use client";

import { useMemo, useState } from "react";
import { useWizard } from "@/components/wizard/state";
import { getAgent } from "@/lib/agents";
import { getScenario } from "@/lib/scenarios";
import { redact, redactToHtml } from "@/lib/redact";

function buildTranscript(state: ReturnType<typeof useWizard>["state"]): string {
  const lines: string[] = [];
  const sc = state.scenarioId ? getScenario(state.scenarioId) : null;
  lines.push(`# Gambit War Room , ${sc?.headline ?? state.doc?.filename ?? "untitled"}`);
  lines.push("");
  lines.push(`**Goal:** ${state.goal}`);
  lines.push("");
  lines.push(`**Final win bar:** ${state.score.toFixed(1)}`);
  lines.push(`**Decisions taken:** ${state.decisionPath.length}`);
  lines.push("");
  lines.push("## Debate transcript");
  for (const t of state.debate) {
    const a = getAgent(t.agentId);
    lines.push(
      `- **${a?.name ?? t.agentId}** (${a?.role ?? ""}, round ${t.round + 1}, Δ ${t.delta > 0 ? "+" : ""}${t.delta}): ${t.text}`,
    );
  }
  if (state.decisionTree.length > 0) {
    lines.push("");
    lines.push("## Decision path");
    let i = 0;
    for (const n of state.decisionTree.filter((x) => state.decisionPath.includes(x.id))) {
      i += 1;
      lines.push(`${i}. ${n.label} (Δ ${n.delta > 0 ? "+" : ""}${n.delta}, cumulative ${n.cumulativeScore.toFixed(1)})`);
    }
  }
  if (state.context.length > 0) {
    lines.push("");
    lines.push("## Context provided");
    for (const c of state.context) {
      const a = getAgent(c.agentId);
      lines.push(`- **${a?.name ?? c.agentId}** , Q: ${c.question}\n  A: ${c.answer}`);
    }
  }
  return lines.join("\n");
}

export function ExportStep() {
  const { state, dispatch } = useWizard();
  const scenario = state.scenarioId ? getScenario(state.scenarioId) : null;
  const [redactOn, setRedactOn] = useState(true);
  const [extraNames, setExtraNames] = useState(
    (state.redactionNames.length > 0 ? state.redactionNames : scenario?.sensitiveNames ?? []).join(", "),
  );

  const transcript = useMemo(() => buildTranscript(state), [state]);
  const extras = useMemo(
    () => extraNames.split(",").map((s) => s.trim()).filter(Boolean),
    [extraNames],
  );
  const preview = useMemo(() => {
    const r = redactToHtml(transcript, extras);
    const plain = redact(transcript, extras);
    return {
      html: redactOn
        ? r.html
        : transcript
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;"),
      count: redactOn ? r.total : 0,
      byKind: redactOn ? r.countByKind : {},
      plain: redactOn ? plain.text : transcript,
    };
  }, [transcript, redactOn, extras]);

  async function download() {
    dispatch({ type: "SET_REDACT_NAMES", names: extras });
    const r = await fetch("/api/chat/export", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text: transcript,
        redact: redactOn,
        extraNames: extras,
      }),
    });
    if (!r.ok) {
      alert("Export failed");
      return;
    }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = redactOn ? "warroom-chat.redacted.md" : "warroom-chat.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    dispatch({ type: "SET_EXPORTED_CHAT", url });
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h2 className="text-[22px] font-semibold tracking-tight">Export the chat</h2>
        <p className="muted text-[13px]">
          Toggle redaction to strip emails, phone numbers, dollar amounts, dates,
          and any extra names you list.
        </p>
      </header>

      <div className="card flex flex-wrap items-center gap-3 px-5 py-3">
        <label className="flex cursor-pointer items-center gap-2 text-[13px]">
          <input type="checkbox" checked={redactOn} onChange={(e) => setRedactOn(e.target.checked)} />
          Redact sensitive info
        </label>
        <span className="muted text-[12px]">
          {preview.count} match{preview.count === 1 ? "" : "es"}
          {preview.count > 0 && Object.keys(preview.byKind).length > 0
            ? ` (${Object.entries(preview.byKind).map(([k, n]) => `${k}:${n}`).join(", ")})`
            : ""}
        </span>
      </div>

      <div className="card px-5 py-3">
        <p className="label">Extra names to redact</p>
        <input
          type="text"
          className="input mt-2"
          value={extraNames}
          onChange={(e) => setExtraNames(e.target.value)}
        />
        {scenario ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="muted text-[11px]">Suggested:</span>
            {scenario.sensitiveNames.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() =>
                  setExtraNames((s) =>
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
        ) : null}
      </div>

      <pre
        className="card scroll-y px-5 py-5 font-mono text-[12px]"
        style={{ maxHeight: 360, whiteSpace: "pre-wrap" }}
        dangerouslySetInnerHTML={{ __html: preview.html }}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: "BACK" })}>← Back</button>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary" onClick={() => void download()}>
            Download .md
          </button>
          <button type="button" className="btn" onClick={() => dispatch({ type: "GOTO", step: "meeting" })}>
            Continue → Need a meeting?
          </button>
        </div>
      </div>
    </div>
  );
}
