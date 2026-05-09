"use client";

import { useEffect, useState } from "react";
import { useWizard } from "@/components/wizard/state";
import type { EsigResult } from "@/lib/types";

export function EsigStep() {
  const { state, dispatch } = useWizard();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.esig) return;
    if (!state.doc) return;
    setBusy(true);
    void fetch("/api/esig", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: state.doc.text }),
    })
      .then(async (r) => {
        const j = (await r.json()) as
          | { ok: true; data: EsigResult }
          | { ok: false; error: { message: string } };
        if (!j.ok) throw new Error(j.error.message);
        dispatch({ type: "SET_ESIG", esig: j.data });
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setBusy(false));
  }, [state.doc, state.esig, dispatch]);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h2 className="text-[22px] font-semibold tracking-tight">E-signature scan</h2>
        <p className="muted text-[13px]">
          Checking whether this contract can be electronically signed in Quebec.
        </p>
      </header>

      {busy ? (
        <div className="flex items-center gap-2 text-[14px]">
          <span className="spinner" />
          Scanning…
        </div>
      ) : error ? (
        <p className="text-[13px]" style={{ color: "var(--negative)" }}>{error}</p>
      ) : state.esig ? (
        <EsigReport result={state.esig} />
      ) : null}

      <Footer
        onBack={() => dispatch({ type: "BACK" })}
        onNext={() => dispatch({ type: "GOTO", step: "workflow" })}
        disabled={busy || !state.esig}
      />
    </div>
  );
}

function EsigReport({ result }: { result: EsigResult }) {
  return (
    <div className="grid gap-4 md:grid-cols-[260px_1fr]">
      <div
        className="card flex flex-col items-center justify-center px-5 py-6 text-center"
        style={{
          borderColor: result.qcAvailable ? "var(--positive)" : "var(--negative)",
          background: result.qcAvailable ? "#eaf6ee" : "#fdecea",
        }}
      >
        <span
          className="text-[12px] font-semibold uppercase tracking-widest"
          style={{ color: result.qcAvailable ? "var(--positive)" : "var(--negative)" }}
        >
          Quebec
        </span>
        <p className="mt-2 text-[22px] font-semibold">
          {result.qcAvailable ? "E-sig available" : "E-sig restricted"}
        </p>
        <p className="muted mt-2 text-[12px]">
          {result.signatureBlocksFound} signature block(s) found in the document.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="card px-5 py-4">
          <h3 className="text-[14px] font-semibold">Findings</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px]">
            {result.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
        <div className="card px-5 py-4">
          <h3 className="text-[14px] font-semibold">References</h3>
          <ul className="mt-2 space-y-1 text-[13px]">
            {result.citations.map((c) => (
              <li key={c.url}>
                <a href={c.url} target="_blank" rel="noreferrer noopener">
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
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
        Continue → Build the workflow
      </button>
    </div>
  );
}
