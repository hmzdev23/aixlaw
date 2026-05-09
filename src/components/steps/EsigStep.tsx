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

  const signedCount = state.signatures.length;
  const totalSigs = sigBlocks.length;

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
            Step &middot; E-signature
          </span>
          <h2 className="mt-2 text-[24px] font-semibold tracking-tight">
            E-signature scan
          </h2>
          <p className="subhead text-[13px]">
            Quebec recognises e-sig under CQLR c. C-1.1 + UECA. Sign each block
            below by drawing.
          </p>
        </div>
        <div
          className="flex items-center gap-3 rounded-full border px-3 py-1.5 text-[12px] fade-in stagger-1"
          style={{
            borderColor:
              signedCount === totalSigs && totalSigs > 0
                ? "var(--green)"
                : "var(--line-strong)",
            background:
              signedCount === totalSigs && totalSigs > 0
                ? "var(--green-soft, #e7f1ea)"
                : "white",
            color:
              signedCount === totalSigs && totalSigs > 0
                ? "var(--green-deep, #185538)"
                : "var(--ink-soft)",
          }}
        >
          <span className="pulse-dot" style={{ background: "var(--green)" }} />
          <span className="font-semibold tabular-nums">
            {signedCount}/{totalSigs}
          </span>
          <span>signed</span>
        </div>
      </header>

      {busy ? (
        <p className="flex items-center gap-2 text-[14px] fade-in">
          <span className="spinner" /> Scanning&hellip;
        </p>
      ) : error ? (
        <p className="text-[13px]" style={{ color: "var(--negative)" }}>
          {error}
        </p>
      ) : state.esig ? (
        <EsigReport result={state.esig} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {sigBlocks.map((p, i) => {
          const party = p.id === sigBlocks[0]?.id ? "vendor" : "client";
          const partyLabel =
            party === "vendor" ? scenario.vendor : scenario.counterparty;
          const existing = state.signatures.find(
            (s) => s.paragraphIndex === p.id,
          );
          return (
            <SignaturePad
              key={p.id}
              paragraphId={p.id}
              party={party}
              partyLabel={partyLabel}
              blockText={p.en}
              existing={existing}
              index={i}
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
              onClear={() =>
                dispatch({ type: "CLEAR_SIGNATURE", paragraphIndex: p.id })
              }
            />
          );
        })}
      </div>

      <div className="mt-2 flex justify-between">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => dispatch({ type: "BACK" })}
        >
          &larr; Back
        </button>
        <button
          type="button"
          className="btn btn-accent"
          onClick={() => dispatch({ type: "GOTO", step: "violations" })}
        >
          Continue &rarr; Scan for violations
        </button>
      </div>
    </div>
  );
}

function EsigReport({ result }: { result: EsigResult }) {
  const ok = result.qcAvailable;
  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr] fade-in">
      <div
        className="card flex flex-col items-center justify-center px-5 py-6 text-center lift-on-hover"
        style={{
          borderColor: ok ? "var(--green)" : "var(--negative)",
          background: ok ? "var(--green-soft, #e7f1ea)" : "#fdecea",
          borderLeft: `4px solid ${ok ? "var(--green)" : "var(--negative)"}`,
        }}
      >
        <span
          className="rounded-full border px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{
            color: ok ? "var(--green-deep, #185538)" : "var(--negative)",
            borderColor: ok ? "var(--green)" : "var(--negative)",
            background: "white",
          }}
        >
          Quebec &middot; jurisdiction
        </span>
        <p
          className="mt-3 text-[22px] font-semibold"
          style={{ color: ok ? "var(--green-deep, #185538)" : "var(--negative)" }}
        >
          {ok ? "E-sig available" : "E-sig restricted"}
        </p>
        <p className="mt-2 text-[12px]" style={{ color: "var(--ink-soft)" }}>
          <strong className="font-semibold tabular-nums">
            {result.signatureBlocksFound}
          </strong>{" "}
          signature block{result.signatureBlocksFound === 1 ? "" : "s"} detected.
        </p>
        <span
          className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: ok ? "var(--green-deep, #185538)" : "var(--negative)" }}
        >
          <span
            className="pulse-dot"
            style={{ background: ok ? "var(--green)" : "var(--negative)" }}
          />
          {ok ? "Cleared to sign" : "Manual review required"}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <div className="card card-tonal px-5 py-4">
          <h3
            className="text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--green-deep, #185538)" }}
          >
            Findings
          </h3>
          <ul className="mt-2 space-y-1.5 text-[13px]" style={{ color: "var(--ink)" }}>
            {result.notes.map((n) => (
              <li key={n} className="flex gap-2">
                <span style={{ color: "var(--green)" }}>&bull;</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card card-bordered px-5 py-4">
          <h3
            className="text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--ink-soft)" }}
          >
            References
          </h3>
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

function SignaturePad({
  paragraphId,
  party,
  partyLabel,
  blockText,
  existing,
  index,
  onSigned,
  onClear,
}: {
  paragraphId: number;
  party: "vendor" | "client";
  partyLabel: string;
  blockText: string;
  existing?: SignatureRecord;
  index: number;
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
  const isSigned = !!existing;
  void paragraphId;

  return (
    <div
      className={`card overflow-hidden lift-on-hover fade-in stagger-${(index % 5) + 1}`}
      style={{
        borderColor: isSigned ? "var(--green)" : "var(--line)",
        boxShadow: isSigned
          ? "0 6px 20px rgba(30, 110, 74, 0.10)"
          : undefined,
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          borderBottom: "1px solid var(--line)",
          background: isSigned
            ? "linear-gradient(180deg, var(--green-soft, #e7f1ea) 0%, white 100%)"
            : "linear-gradient(180deg, var(--accent-soft) 0%, white 100%)",
        }}
      >
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{
              color: isSigned ? "var(--green-deep, #185538)" : "var(--muted)",
            }}
          >
            {party === "vendor" ? "Vendor" : "Client"}
          </p>
          <p
            className="text-[14px] font-semibold"
            style={{ color: "var(--ink)" }}
          >
            {partyLabel}
          </p>
        </div>
        <span
          className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
          style={{
            borderColor: isSigned ? "var(--green)" : "var(--line-strong)",
            color: isSigned ? "var(--green-deep, #185538)" : "var(--muted)",
            background: isSigned ? "white" : "transparent",
          }}
        >
          {isSigned ? "Signed" : "Awaiting"}
        </span>
      </div>
      <div className="px-5 py-4">
        <p
          className="text-[11px]"
          style={{ color: "var(--ink-soft)", fontStyle: "italic" }}
        >
          {headerLine}
        </p>
        <div className="mt-3 grid gap-3 text-[12px]">
          <Field label="Signature">
            <div
              className="relative rounded-md"
              style={{
                background:
                  "repeating-linear-gradient(0deg, transparent 0 23px, var(--line) 23px 24px)",
                border: `1px solid ${isSigned ? "var(--green)" : "var(--line-strong)"}`,
              }}
            >
              <canvas
                ref={canvasRef}
                width={420}
                height={96}
                className="block w-full rounded-md"
                style={{
                  background: "transparent",
                  touchAction: "none",
                  cursor: "crosshair",
                }}
                onPointerDown={start}
                onPointerMove={move}
                onPointerUp={end}
                onPointerLeave={end}
              />
              <span
                className="pointer-events-none absolute bottom-1 left-2 text-[10px] tracking-wider"
                style={{ color: "var(--muted)" }}
              >
                X _____________________
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span
                className="text-[11px]"
                style={{
                  color: existing ? "var(--green-deep, #185538)" : "var(--muted)",
                }}
              >
                {existing
                  ? `Signed at ${new Date(existing.signedAt).toLocaleTimeString()}`
                  : "Draw your signature above"}
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
            <input
              className="input"
              placeholder="Full name"
              defaultValue={party === "vendor" ? "Sarah Chen" : "J. Doe"}
            />
          </Field>
          <Field label="Title">
            <input
              className="input"
              placeholder="Title"
              defaultValue={
                party === "vendor"
                  ? "Co-founder & COO"
                  : "Procurement Counsel"
              }
            />
          </Field>
          <Field label="Date">
            <input
              className="input"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
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
