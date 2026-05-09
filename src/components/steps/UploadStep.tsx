"use client";

import { useCallback, useRef, useState } from "react";
import { useWizard } from "@/components/wizard/state";
import type { ParsedDocument } from "@/lib/types";

export function UploadStep() {
  const { dispatch } = useWizard();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const submit = useCallback(
    async (file: File) => {
      setBusy(true);
      setError(null);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/document/parse", { method: "POST", body: fd });
        const json = (await res.json()) as
          | { ok: true; data: ParsedDocument }
          | { ok: false; error: { message: string } };
        if (!json.ok) throw new Error(json.error.message);
        dispatch({ type: "SET_DOC", doc: json.data });
        dispatch({ type: "GOTO", step: "review" });
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [dispatch],
  );

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

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-5 py-6">
      <header className="text-center">
        <h2 className="text-[26px] font-semibold tracking-tight">Upload a contract</h2>
        <p className="muted mt-2 text-[14px]">
          PDF or DOCX, up to 12 MB. We&apos;ll extract the text and walk you
          through it step-by-step.
        </p>
      </header>

      <label
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-12 text-center transition-colors"
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
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="hidden"
          onChange={onPickFile}
          disabled={busy}
        />
        {busy ? (
          <>
            <span className="spinner" aria-hidden />
            <p className="text-[14px]">Reading the document…</p>
          </>
        ) : (
          <>
            <p className="text-[15px] font-medium">Drop a file here or click to browse</p>
            <p className="muted text-[12px]">
              PDF · DOCX · TXT · MD
            </p>
          </>
        )}
      </label>

      <div className="muted text-center text-[12px]">
        Or paste text:
      </div>
      <PasteFallback onSubmit={(t) => void submitText(t, dispatch, setError, setBusy)} />

      {error ? (
        <p className="text-[13px]" style={{ color: "var(--negative)" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

async function submitText(
  text: string,
  dispatch: ReturnType<typeof useWizard>["dispatch"],
  setError: (s: string | null) => void,
  setBusy: (b: boolean) => void,
) {
  setBusy(true);
  setError(null);
  try {
    const res = await fetch("/api/document/parse", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, filename: "pasted.txt" }),
    });
    const json = (await res.json()) as
      | { ok: true; data: ParsedDocument }
      | { ok: false; error: { message: string } };
    if (!json.ok) throw new Error(json.error.message);
    dispatch({ type: "SET_DOC", doc: json.data });
    dispatch({ type: "GOTO", step: "review" });
  } catch (e) {
    setError((e as Error).message);
  } finally {
    setBusy(false);
  }
}

function PasteFallback({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [v, setV] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <textarea
        className="textarea"
        placeholder="Paste contract text here…"
        value={v}
        onChange={(e) => setV(e.target.value)}
      />
      <div className="flex justify-end">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={v.trim().length < 30}
          onClick={() => onSubmit(v.trim())}
        >
          Use this text
        </button>
      </div>
    </div>
  );
}
