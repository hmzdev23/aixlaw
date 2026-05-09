"use client";

import { useCallback, useState } from "react";
import { useWizard } from "@/components/wizard/state";
import { SCENARIOS } from "@/lib/scenarios";
import type { ParsedDocument } from "@/lib/types";

export function UploadStep() {
  const { dispatch } = useWizard();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [detected, setDetected] = useState<ParsedDocument | null>(null);

  const submit = useCallback(async (file: File) => {
    setBusy(true);
    setError(null);
    setDetected(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/document/parse", { method: "POST", body: fd });
      const json = (await res.json()) as
        | { ok: true; data: ParsedDocument }
        | { ok: false; error: { message: string } };
      if (!json.ok) throw new Error(json.error.message);
      setDetected(json.data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void submit(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void submit(f);
  }

  function pickScenario(id: keyof typeof SCENARIOS) {
    const s = SCENARIOS[id];
    const fake: ParsedDocument = {
      filename: `${id}_demo.pdf`,
      mime: "application/pdf",
      scenarioId: id,
      paragraphs: s.paragraphs.map((p) => p.en),
      frParagraphs: s.paragraphs.map((p) => p.fr),
      signatureBlockIndices: s.paragraphs
        .map((p, i) => (p.isSignatureBlock ? i : -1))
        .filter((i) => i >= 0),
      byteSize: 0,
    };
    setDetected(fake);
  }

  function commit() {
    if (!detected) return;
    dispatch({ type: "SET_DOC", doc: detected });
    dispatch({ type: "SET_SCENARIO", scenarioId: detected.scenarioId });
    dispatch({ type: "GOTO", step: "review" });
  }

  return (
    <div className="mx-auto flex max-w-[680px] flex-col gap-5 py-4">
      <header className="text-center">
        <h2 className="text-[26px] font-semibold tracking-tight">Upload a contract</h2>
        <p className="muted mt-2 text-[14px]">
          PDF or DOCX. We auto-detect which demo scenario it belongs to and load
          a hardcoded contract package. You can also pick a scenario directly.
        </p>
      </header>

      <label
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-10 text-center transition-colors"
        style={{
          borderColor: drag ? "var(--ink)" : "var(--line-strong)",
          background: drag ? "var(--accent-soft)" : "white",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="hidden"
          onChange={onPickFile}
          disabled={busy}
        />
        {busy ? (
          <>
            <span className="spinner" aria-hidden />
            <p className="text-[14px]">Detecting scenario…</p>
          </>
        ) : (
          <>
            <p className="text-[15px] font-medium">Drop a contract here or click to browse</p>
            <p className="muted text-[12px]">Try the files in <span className="kbd">/scenarios</span></p>
          </>
        )}
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        {(Object.keys(SCENARIOS) as (keyof typeof SCENARIOS)[]).map((id) => {
          const s = SCENARIOS[id];
          const isPicked = detected?.scenarioId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => pickScenario(id)}
              className="card text-left transition-colors hover:border-[var(--ink)]"
              style={{
                padding: "14px 16px",
                borderColor: isPicked ? "var(--ink)" : undefined,
                background: isPicked ? "var(--accent-soft)" : "white",
              }}
            >
              <p className="text-[12px] uppercase tracking-widest muted">
                {id === "dunder" ? "Track A" : "Track B"}
              </p>
              <p className="mt-1 text-[15px] font-semibold">
                {s.vendor.split(" ")[0]} ↔ {s.counterparty.split(" ")[0]}
              </p>
              <p className="muted mt-1 text-[12px]">{s.context}</p>
            </button>
          );
        })}
      </div>

      {detected ? (
        <div
          className="card flex items-center justify-between gap-3 px-5 py-4"
          style={{ borderColor: "var(--ink)" }}
        >
          <div>
            <p className="text-[12px] uppercase tracking-widest muted">Detected scenario</p>
            <p className="text-[15px] font-semibold">{SCENARIOS[detected.scenarioId].headline}</p>
            <p className="muted text-[12px]">
              {detected.paragraphs.length} paragraphs · file:{" "}
              <span className="kbd">{detected.filename}</span>
            </p>
          </div>
          <button type="button" className="btn" onClick={commit}>
            Use this scenario →
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="text-[13px]" style={{ color: "var(--negative)" }}>{error}</p>
      ) : null}
    </div>
  );
}
