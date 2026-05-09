"use client";

import { useState } from "react";
import type { WalkawayLine as WalkawayLineType } from "@/lib/contracts/models";
import { X } from "lucide-react";

interface WalkawayLineProps {
  line: WalkawayLineType;
}

export function WalkawayLine({ line }: WalkawayLineProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <div className="relative">
      {/* The line */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <X size={14} style={{ color: "var(--color-error)" }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-error)" }}>
            Walkaway
          </span>
        </div>
        <div className="flex-1 h-px" style={{ background: "var(--color-error)", opacity: 0.4 }} />
        <div className="flex gap-2">
          {line.citations.map((c, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(activeIdx === i ? null : i)}
              className="text-xs px-2 py-1 rounded-full font-medium transition-colors"
              style={{
                background: activeIdx === i ? "rgba(255,59,48,0.1)" : "transparent",
                border: "1px solid rgba(255,59,48,0.3)",
                color: "var(--color-error)",
              }}
              aria-expanded={activeIdx === i}
              aria-label={`Citation ${i + 1}: ${c.dealLabel}`}
            >
              {c.dealLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Threshold summary */}
      <p className="mt-1 text-xs" style={{ color: "var(--color-gray-400)" }}>
        {line.thresholdSummary}
      </p>

      {/* Popover */}
      {activeIdx !== null && (
        <div
          className="absolute top-full left-0 mt-2 w-80 rounded-xl border p-4 z-20 shadow-xl"
          style={{ background: "white", borderColor: "var(--color-gray-200)" }}
          role="tooltip"
        >
          <button
            className="absolute top-2 right-2"
            onClick={() => setActiveIdx(null)}
            aria-label="Close citation"
          >
            <X size={14} style={{ color: "var(--color-gray-400)" }} />
          </button>
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-error)" }}>
            {line.citations[activeIdx].dealLabel}
          </p>
          <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--color-gray-600)" }}>
            &ldquo;{line.citations[activeIdx].quote}&rdquo;
          </p>
          <p className="text-xs font-mono" style={{ color: "var(--color-gray-400)" }}>
            {line.citations[activeIdx].clauseRef}
          </p>
        </div>
      )}
    </div>
  );
}
