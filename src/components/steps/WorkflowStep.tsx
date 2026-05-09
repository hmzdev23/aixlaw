"use client";

import { useState } from "react";
import { useWizard } from "@/components/wizard/state";
import { AGENTS } from "@/lib/agents";

const SLOT_COUNT = 5;

export function WorkflowStep() {
  const { state, dispatch } = useWizard();
  // Pad workflow to fixed slot count for clean visual rendering.
  const slots: (string | null)[] = Array.from({ length: SLOT_COUNT }, (_, i) => state.workflow[i] ?? null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

  function commit(next: (string | null)[]) {
    const clean = next.filter((x): x is string => !!x);
    dispatch({ type: "SET_WORKFLOW", workflow: clean });
  }

  function dropOnSlot(idx: number, agentId: string) {
    const next = [...slots];
    // Remove from elsewhere first to avoid duplicates.
    for (let i = 0; i < next.length; i += 1) {
      if (next[i] === agentId) next[i] = null;
    }
    next[idx] = agentId;
    commit(next);
  }

  function clearSlot(idx: number) {
    const next = [...slots];
    next[idx] = null;
    commit(next);
  }

  function reset() {
    commit(["pierre", "marie", "etienne", "sophie", "antoine"]);
  }

  function clearAll() {
    commit([null, null, null, null, null]);
  }

  const usedIds = new Set(slots.filter(Boolean) as string[]);
  const available = AGENTS.filter((a) => !usedIds.has(a.id));

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
            Step &middot; Workflow
          </span>
          <h2 className="mt-2 text-[24px] font-semibold tracking-tight">Build your workflow</h2>
          <p className="subhead text-[13px]">
            Drag an agent onto a numbered slot. Drag between slots to reorder.
            Click <span className="kbd">&times;</span> on a slot to remove. Empty slots are skipped.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-ghost" onClick={clearAll}>Clear all</button>
          <button type="button" className="btn btn-secondary" onClick={reset}>Reset</button>
        </div>
      </header>

      <div className="card px-4 py-6 md:px-6">
        <div className="flex flex-wrap items-stretch justify-center gap-3 md:flex-nowrap">
          {slots.map((id, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <SlotBox
                index={idx}
                agentId={id}
                isOver={dragOverSlot === idx}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverSlot(idx);
                }}
                onDragLeave={() => setDragOverSlot((s) => (s === idx ? null : s))}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverSlot(null);
                  const dropped = draggingId ?? e.dataTransfer.getData("text/plain");
                  if (dropped) dropOnSlot(idx, dropped);
                  setDraggingId(null);
                }}
                onClear={() => clearSlot(idx)}
                onStartDrag={(e) => {
                  if (!id) return;
                  setDraggingId(id);
                  e.dataTransfer.setData("text/plain", id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onEndDrag={() => setDraggingId(null)}
              />
              {idx < slots.length - 1 ? <Arrow /> : null}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="label mb-2">Available agents</p>
        <div className="flex flex-wrap gap-2">
          {available.length === 0 ? (
            <p className="muted text-[12px]">All five agents placed.</p>
          ) : (
            available.map((a) => (
              <div
                key={a.id}
                draggable
                onDragStart={(e) => {
                  setDraggingId(a.id);
                  e.dataTransfer.setData("text/plain", a.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => setDraggingId(null)}
                className="card flex items-center gap-3 px-3 py-2"
                style={{ cursor: "grab", minWidth: 200 }}
              >
                <span
                  className="grid h-7 w-7 place-items-center rounded-full text-[12px] font-semibold"
                  style={{ background: "var(--accent-soft)" }}
                >
                  {a.emoji}
                </span>
                <div>
                  <p className="text-[13px] font-semibold leading-tight">{a.name}</p>
                  <p className="muted text-[11px] leading-tight">{a.role}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-2 flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: "BACK" })}>&larr; Back</button>
        <button
          type="button"
          className="btn btn-accent"
          onClick={() => dispatch({ type: "GOTO", step: "goal" })}
          disabled={state.workflow.length === 0}
        >
          Continue &rarr; State your goal
        </button>
      </div>
    </div>
  );
}

function SlotBox({
  index,
  agentId,
  isOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onClear,
  onStartDrag,
  onEndDrag,
}: {
  index: number;
  agentId: string | null;
  isOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onClear: () => void;
  onStartDrag: (e: React.DragEvent) => void;
  onEndDrag: () => void;
}) {
  const agent = AGENTS.find((a) => a.id === agentId);
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="relative flex flex-col items-center justify-center rounded-xl border text-center"
      style={{
        width: 144,
        height: 152,
        borderStyle: agent ? "solid" : "dashed",
        borderColor: isOver ? "var(--ink)" : agent ? "var(--ink)" : "var(--line-strong)",
        background: isOver ? "var(--accent-soft)" : "white",
      }}
    >
      <span
        className="absolute left-2 top-2 text-[10px] font-semibold tabular-nums"
        style={{ color: "var(--muted)" }}
      >
        SLOT {index + 1}
      </span>
      {agent ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full text-[11px]"
          style={{ background: "var(--accent-soft)", color: "var(--ink)" }}
          aria-label={`Remove ${agent.name} from slot ${index + 1}`}
        >
          ×
        </button>
      ) : null}
      {agent ? (
        <div
          draggable
          onDragStart={onStartDrag}
          onDragEnd={onEndDrag}
          className="flex flex-col items-center gap-1"
          style={{ cursor: "grab" }}
        >
          <span
            className="grid h-10 w-10 place-items-center rounded-full text-[14px] font-semibold"
            style={{ background: "var(--accent-soft)" }}
          >
            {agent.emoji}
          </span>
          <p className="text-[13px] font-semibold leading-tight">{agent.name}</p>
          <p className="muted text-[11px] leading-tight">{agent.role}</p>
        </div>
      ) : (
        <p className="muted text-[12px]">Drop an agent here</p>
      )}
    </div>
  );
}

function Arrow() {
  return (
    <svg width="36" height="14" viewBox="0 0 36 14" aria-hidden>
      <line x1="0" y1="7" x2="28" y2="7" stroke="currentColor" strokeWidth="1.4" />
      <polyline
        points="22,2 30,7 22,12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
