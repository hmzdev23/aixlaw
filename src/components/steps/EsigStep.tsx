"use client";

import { useEffect, useRef, useState } from "react";
import { useWizard, type SignatureRecord } from "@/components/wizard/state";
import { getScenario } from "@/lib/scenarios";
import type { EsigResult } from "@/lib/types";

export function EsigStep() {
  const { state, dispatch } = useWizard();
  const scenario = state.scenarioId ? getScenario(state.scenarioId) : null;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.esig || !state.scenarioId) return;
    setBusy(true);
    void fetch("/api/esig", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scenarioId: state.scenarioId }),
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
  }, [state.esig, state.scenarioId, dispatch]);

  if (!scenario) return <p className="muted">Upload a contract first.</p>;

  const sigBlocks = scenario.paragraphs.filter((p) => p.isSignatureBlock);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h2 className="text-[22px] font-semibold tracking-tight">E-signature scan</h2>
        <p className="muted text-[13px]">
          Quebec recognises e-sig under CQLR c. C-1.1 + UECA. Sign each block below by drawing.
        </p>
      </header>

      {busy ? (
        <p className="flex items-center gap-2 text-[14px]"><span className="spinner" /> Scanning…</p>
      ) : error ? (
        <p className="text-[13px]" style={{ color: "var(--negative)" }}>{error}</p>
      ) : state.esig ? (
        <EsigReport result={state.esig} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {sigBlocks.map((p) => {
          const party = p.id === sigBlocks[0]?.id ? "vendor" : "client";
          const partyLabel =
            party === "vendor" ? scenario.vendor : scenario.counterparty;
          const existing = state.signatures.find((s) => s.paragraphIndex === p.id);
          return (
            <SignaturePad
              key={p.id}
              paragraphId={p.id}
              party={party}
              partyLabel={partyLabel}
              blockText={p.en}
              existing={existing}
              onSigned={(dataUrl) =>
                dispatch({
                  type: "ADD_SIGNATURE",
                  sig: {
                    paragraphIndex: p.id,
                    party,
                    dataUrl,
                    signedAt: new Date().toISOString(),
                  },
                })
              }
              onClear={() => dispatch({ type: "CLEAR_SIGNATURE", paragraphIndex: p.id })}
            />
          );
        })}
      </div>

      <div className="mt-2 flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: "BACK" })}>← Back</button>
        <button
          type="button"
          className="btn"
          onClick={() => dispatch({ type: "GOTO", step: "workflow" })}
        >
          Continue → Build the workflow
        </button>
      </div>
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
          {result.signatureBlocksFound} signature block(s) detected.
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
                <a href={c.url} target="_blank" rel="noreferrer noopener">{c.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SignaturePad({
  paragraphId,
  party,
  partyLabel,
  blockText,
  existing,
  onSigned,
  onClear,
}: {
  paragraphId: number;
  party: "vendor" | "client";
  partyLabel: string;
  blockText: string;
  existing?: SignatureRecord;
  onSigned: (dataUrl: string) => void;
  onClear: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  // Re-render existing signature on mount (e.g. after step navigation).
  useEffect(() => {
    if (!existing) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const img = new Image();
    img.onload = () => {
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      setIsEmpty(false);
    };
    img.src = existing.dataUrl;
  }, [existing]);

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const cv = canvasRef.current!;
    const rect = cv.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    cv.setPointerCapture(e.pointerId);
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsEmpty(false);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0a0a0a";
    ctx.stroke();
  }

  function end() {
    drawing.current = false;
    const cv = canvasRef.current;
    if (!cv) return;
    if (isEmpty) return;
    onSigned(cv.toDataURL("image/png"));
  }

  function clear() {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.getContext("2d")?.clearRect(0, 0, cv.width, cv.height);
    setIsEmpty(true);
    onClear();
  }

  // First and last lines of the block become a faux preview.
  const lines = blockText.split("\n").filter(Boolean);
  const headerLine = lines[0] ?? "";

  return (
    <div className="card overflow-hidden">
      <div className="border-b px-5 py-3" style={{ borderColor: "var(--line)", background: "var(--accent-soft)" }}>
        <p className="text-[11px] uppercase tracking-widest muted">{party === "vendor" ? "Vendor" : "Client"}</p>
        <p className="text-[14px] font-semibold">{partyLabel}</p>
      </div>
      <div className="px-5 py-3">
        <p className="muted text-[11px]">{headerLine}</p>
        <div className="mt-3 grid gap-3 text-[12px]">
          <Field label="Signature">
            <canvas
              ref={canvasRef}
              width={420}
              height={96}
              className="block w-full rounded-md border"
              style={{
                borderColor: "var(--line-strong)",
                background: "white",
                touchAction: "none",
                cursor: "crosshair",
              }}
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={end}
              onPointerLeave={end}
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="muted text-[11px]">
                {existing ? `Signed at ${new Date(existing.signedAt).toLocaleTimeString()}` : "Draw your signature above"}
              </span>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ height: 28, padding: "0 12px" }}
                onClick={clear}
              >
                Clear
              </button>
            </div>
          </Field>
          <Field label="Name">
            <input className="input" placeholder="Full name" defaultValue={party === "vendor" ? "Sarah Chen" : "J. Doe"} />
          </Field>
          <Field label="Title">
            <input className="input" placeholder="Title" defaultValue={party === "vendor" ? "Co-founder & COO" : "Procurement Counsel"} />
          </Field>
          <Field label="Date">
            <input className="input" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </Field>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export default EsigStep;
