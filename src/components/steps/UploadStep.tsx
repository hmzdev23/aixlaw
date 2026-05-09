"use client";

import { useEffect, useRef, useState } from "react";
import { useWizard } from "@/components/wizard/state";
import { getScenario } from "@/lib/scenarios";
import type { ParsedDocument } from "@/lib/types";

const STAGES = [
  "Reading document",
  "Identifying parties",
  "Loading negotiation playbook",
  "Booting council",
];

export function UploadStep() {
  const { dispatch } = useWizard();
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [phase, setPhase] = useState<"idle" | "parsing" | "loading" | "ready">("idle");
  const [stage, setStage] = useState(0);
  const [detected, setDetected] = useState<ParsedDocument | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  async function submit(file: File) {
    setError(null);
    setPhase("parsing");
    setStage(0);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/document/parse", { method: "POST", body: fd });
      const json = (await res.json()) as
        | { ok: true; data: ParsedDocument }
        | { ok: false; error: { message: string } };
      if (!json.ok) throw new Error(json.error.message);
      setDetected(json.data);
      setPhase("loading");
      runLoadingSequence(json.data);
    } catch (e) {
      setError((e as Error).message);
      setPhase("idle");
    }
  }

  function runLoadingSequence(doc: ParsedDocument) {
    let i = 0;
    setStage(0);
    const tick = () => {
      i += 1;
      if (i < STAGES.length) {
        setStage(i);
        advanceTimer.current = setTimeout(tick, 850 + i * 80);
      } else {
        setPhase("ready");
        advanceTimer.current = setTimeout(() => {
          dispatch({ type: "SET_DOC", doc });
          dispatch({ type: "SET_SCENARIO", scenarioId: doc.scenarioId });
          dispatch({ type: "GOTO", step: "review" });
        }, 700);
      }
    };
    advanceTimer.current = setTimeout(tick, 850);
  }

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

  if (phase !== "idle") {
    return (
      <LoadingPanel
        stages={STAGES}
        active={stage}
        ready={phase === "ready"}
        scenarioName={
          detected ? getScenario(detected.scenarioId).headline : null
        }
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-[660px] flex-col gap-6 py-4">
      <header className="text-center fade-in">
        <span
          className="inline-block rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{
            borderColor: "var(--green-line, #b9d6c4)",
            color: "var(--green-deep, #185538)",
            background: "var(--green-soft, #e7f1ea)",
          }}
        >
          Step 1 &middot; Upload
        </span>
        <h2 className="mt-3 text-[28px] font-semibold tracking-tight">
          Upload a contract
        </h2>
        <p className="subhead mt-2 text-[14px]">
          PDF, DOCX, or TXT, up to 12 MB. We&apos;ll read it, identify the parties,
          and step you through the negotiation.
        </p>
      </header>

      <label
        className={`upload-zone fade-in stagger-1 ${drag ? "is-drag" : ""}`}
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
        />
        <span className="upload-icon">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 16V4" />
            <path d="m6 10 6-6 6 6" />
            <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
        </span>
        <div className="flex flex-col items-center gap-1">
          <p
            className="text-[16px] font-semibold"
            style={{ color: "var(--ink)" }}
          >
            Click to upload
          </p>
          <p className="text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
            or drag and drop your contract here
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          {["PDF", "DOCX", "TXT"].map((t) => (
            <span
              key={t}
              className="rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider"
              style={{
                borderColor: "var(--line-strong)",
                color: "var(--ink-soft)",
                background: "white",
              }}
            >
              {t}
            </span>
          ))}
          <span className="muted text-[10px]">&middot; max 12 MB</span>
        </div>
        <span className="shimmer-bg pointer-events-none absolute inset-0 rounded-[18px]" />
      </label>

      {error ? (
        <p
          className="rounded-md border px-3 py-2 text-[13px] fade-in"
          style={{
            color: "var(--negative)",
            borderColor: "var(--negative)",
            background: "#fdecea",
          }}
        >
          {error}
        </p>
      ) : null}

    </div>
  );
}

function LoadingPanel({
  stages,
  active,
  ready,
  scenarioName,
}: {
  stages: string[];
  active: number;
  ready: boolean;
  scenarioName: string | null;
}) {
  return (
    <div className="mx-auto flex max-w-[540px] flex-col items-center gap-6 py-10 text-center">
      <span
        className="spinner breathe-green"
        style={{
          width: 32,
          height: 32,
          borderWidth: 3,
          borderTopColor: "var(--green)",
        }}
      />
      <h2 className="text-[22px] font-semibold tracking-tight fade-in">
        {ready ? "Ready" : "Reading the contract"}
      </h2>
      <ul className="card card-tonal w-full px-5 py-4 text-left">
        {stages.map((s, i) => {
          const status = i < active ? "done" : i === active ? "live" : "pending";
          const bg =
            status === "done"
              ? "var(--green)"
              : status === "live"
                ? "var(--green-soft)"
                : "transparent";
          const fg =
            status === "done"
              ? "white"
              : status === "live"
                ? "var(--green-deep)"
                : "var(--ink)";
          const border =
            status === "live"
              ? "1px solid var(--green)"
              : status === "done"
                ? "1px solid var(--green)"
                : "1px solid var(--line)";
          return (
            <li
              key={s}
              className="flex items-center gap-3 py-2 text-[13px]"
              style={{ color: status === "pending" ? "var(--muted)" : "var(--ink)" }}
            >
              <span
                className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold"
                style={{ background: bg, color: fg, border }}
              >
                {status === "done" ? "✓" : i + 1}
              </span>
              <span className="flex-1">{s}</span>
              {status === "live" ? <span className="spinner" /> : null}
            </li>
          );
        })}
      </ul>
      {ready && scenarioName ? (
        <p
          className="fade-in rounded-full border px-3 py-1 text-[12px] font-semibold"
          style={{
            borderColor: "var(--green-line, #b9d6c4)",
            background: "var(--green-soft, #e7f1ea)",
            color: "var(--green-deep, #185538)",
          }}
        >
          Identified: {scenarioName}
        </p>
      ) : null}
    </div>
  );
}
