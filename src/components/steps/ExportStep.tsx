"use client";

import { useMemo, useState } from "react";
import { useWizard } from "@/components/wizard/state";
import { getAgent } from "@/lib/agents";
import { redact } from "@/lib/redact";

function buildTranscript(state: ReturnType<typeof useWizard>["state"]): string {
  const lines: string[] = [];
  lines.push(`# Gambit War Room — ${state.doc?.filename ?? "untitled"}`);
  lines.push("");
  lines.push(`**Goal:** ${state.goal}`);
  lines.push("");
  lines.push(`**Final win bar:** ${state.score.toFixed(1)}`);
  lines.push("");
  lines.push("## Debate transcript");
  for (const t of state.debate) {
    const a = getAgent(t.agentId);
    lines.push(
      `- **${a?.name ?? t.agentId}** (${a?.role ?? ""}, Δ ${t.delta > 0 ? "+" : ""}${t.delta}): ${t.text}`,
    );
  }
  if (state.decisions.length > 0) {
    lines.push("");
    lines.push("## Decision path");
    for (const d of state.decisions) {
      lines.push(
        `1. ${d.label} (Δ ${d.delta > 0 ? "+" : ""}${d.delta}, cumulative ${d.cumulativeScore})`,
      );
    }
  }
  if (state.context.length > 0) {
    lines.push("");
    lines.push("## Context provided");
    for (const c of state.context) {
      const a = getAgent(c.agentId);
      lines.push(`- **${a?.name ?? c.agentId}** — Q: ${c.question}\n  A: ${c.answer}`);
    }
  }
  return lines.join("\n");
}

export function ExportStep() {
  const { state, dispatch } = useWizard();
  const [redactOn, setRedactOn] = useState(true);
  const [extraNames, setExtraNames] = useState(state.redactionNames.join(", "));

  const transcript = useMemo(() => buildTranscript(state), [state]);
  const extras = useMemo(
    () => extraNames.split(",").map((s) => s.trim()).filter(Boolean),
    [extraNames],
  );
  const preview = useMemo(() => {
    const r = redact(transcript, extras);
    return { text: redactOn ? r.text : transcript, count: r.total, byKind: r.countByKind };
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
          One-click redact strips emails, phone numbers, dollar amounts, dates and
          any extra names you list. Preview below.
        </p>
      </header>

      <div className="card flex flex-wrap items-center gap-3 px-5 py-3">
        <label className="flex cursor-pointer items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            checked={redactOn}
            onChange={(e) => setRedactOn(e.target.checked)}
          />
          Redact sensitive info
        </label>
        <span className="muted text-[12px]">
          {preview.count} match{preview.count === 1 ? "" : "es"} found
          {preview.count > 0 && Object.keys(preview.byKind).length > 0
            ? ` (${Object.entries(preview.byKind).map(([k, n]) => `${k}:${n}`).join(", ")})`
            : ""}
        </span>
        <input
          type="text"
          className="input ml-auto max-w-[320px]"
          placeholder="Extra names to redact (comma-separated)"
          value={extraNames}
          onChange={(e) => setExtraNames(e.target.value)}
        />
      </div>

      <pre
        className="card scroll-y px-5 py-5 font-mono text-[12px]"
        style={{ maxHeight: 380, whiteSpace: "pre-wrap" }}
      >
        {preview.text}
      </pre>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: "BACK" })}>
          ← Back
        </button>
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
