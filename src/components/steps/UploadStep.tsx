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
    <div className="mx-auto flex max-w-[640px] flex-col gap-5 py-6">
      <header className="text-center">
        <h2 className="text-[26px] font-semibold tracking-tight">Upload a contract</h2>
        <p className="muted mt-2 text-[14px]">
          PDF or DOCX, up to 12 MB. We&apos;ll read it, identify the parties, and
          step you through it.
        </p>
      </header>

      <label
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-14 text-center transition-colors"
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
        />
        <p className="text-[15px] font-medium">Drop a contract here or click to browse</p>
        <p className="muted text-[12px]">PDF, DOCX, or TXT</p>
      </label>

      {error ? (
        <p className="text-[13px]" style={{ color: "var(--negative)" }}>{error}</p>
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
    <div className="mx-auto flex max-w-[520px] flex-col items-center gap-6 py-10 text-center">
      <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
      <h2 className="text-[22px] font-semibold tracking-tight">
        {ready ? "Ready" : "Reading the contract"}
      </h2>
      <ul className="card w-full px-5 py-4 text-left">
        {stages.map((s, i) => {
          const status = i < active ? "done" : i === active ? "live" : "pending";
          return (
            <li
              key={s}
              className="flex items-center gap-3 py-2 text-[13px]"
              style={{ color: status === "pending" ? "var(--muted)" : "var(--ink)" }}
            >
              <span
                className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold"
                style={{
                  background:
                    status === "done"
                      ? "var(--ink)"
                      : status === "live"
                        ? "var(--accent-soft)"
                        : "transparent",
                  color: status === "done" ? "white" : "var(--ink)",
                  border: status === "live" ? "1px solid var(--ink)" : "1px solid var(--line)",
                }}
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
        <p className="muted fade-in text-[13px]">Identified: {scenarioName}</p>
      ) : null}
    </div>
  );
}
