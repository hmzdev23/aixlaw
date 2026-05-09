"use client";

import { useState } from "react";
import type { RedlineChange } from "@/lib/contracts/models";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

interface RedlinePileProps {
  redlines: RedlineChange[];
  onSelect?: (id: string) => void;
  selectedId?: string;
}

const SEVERITY_MAP: Record<string, { color: string; bg: string; label: string }> = {
  R03: { color: "var(--color-error)", bg: "rgba(255,59,48,0.08)", label: "Critical" },
  R04: { color: "var(--color-error)", bg: "rgba(255,59,48,0.08)", label: "Critical" },
  R09: { color: "var(--color-warning)", bg: "rgba(255,184,0,0.08)", label: "High" },
  R11: { color: "var(--color-warning)", bg: "rgba(255,184,0,0.08)", label: "High" },
  R13: { color: "var(--color-warning)", bg: "rgba(255,184,0,0.08)", label: "High" },
};

function getSeverity(id: string) {
  return SEVERITY_MAP[id] ?? { color: "var(--color-gray-600)", bg: "var(--color-gray-50)", label: "Medium" };
}

function parseRedlineText(text: string) {
  return text
    .replace(/~~([^~]+)~~/g, '<s style="color:var(--color-error)">$1</s>')
    .replace(/\*\*\[INITECH ADD: ([^\]]+)\]\*\*/g, '<mark style="background:rgba(255,184,0,0.2);color:#7A5500;padding:0 2px;border-radius:2px">[INITECH ADD: $1]</mark>')
    .replace(/\*\[INITECH COMMENT: ([^\]]+)\]\*/g, '<em style="color:var(--color-gray-400)">[INITECH COMMENT: $1]</em>');
}

export function RedlinePile({ redlines, onSelect, selectedId }: RedlinePileProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1" role="list" aria-label="Redline changes">
      {redlines.map((r) => {
        const sev = getSeverity(r.id);
        const isSelected = selectedId === r.id;
        const isExpanded = expanded === r.id;

        return (
          <div
            key={r.id}
            role="listitem"
            className="rounded-xl border transition-all cursor-pointer"
            style={{
              borderColor: isSelected ? "var(--color-brand)" : "var(--color-gray-200)",
              background: isSelected ? "var(--color-brand-muted)" : "white",
            }}
            onClick={() => {
              onSelect?.(r.id);
              setExpanded(isExpanded ? null : r.id);
            }}
          >
            <div className="flex items-start gap-3 p-3">
              {/* ID badge */}
              <span
                className="shrink-0 text-xs font-bold px-1.5 py-0.5 rounded font-mono"
                style={{ background: sev.bg, color: sev.color }}
              >
                {r.id}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold truncate" style={{ color: "var(--color-gray-900)" }}>
                    {r.clauseRef}
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    {(r.id === "R03" || r.id === "R04") && (
                      <AlertTriangle size={11} style={{ color: sev.color }} />
                    )}
                    <span className="text-xs" style={{ color: sev.color }}>{sev.label}</span>
                    {isExpanded ? (
                      <ChevronUp size={12} style={{ color: "var(--color-gray-400)" }} />
                    ) : (
                      <ChevronDown size={12} style={{ color: "var(--color-gray-400)" }} />
                    )}
                  </div>
                </div>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--color-gray-600)" }}>
                  {r.summary}
                </p>
              </div>
            </div>

            {isExpanded && (
              <div className="px-3 pb-3 border-t" style={{ borderColor: "var(--color-gray-100)" }}>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-success)" }}>Our position</p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--color-gray-600)" }}>{r.ours}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-error)" }}>Their position</p>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "var(--color-gray-600)" }}
                      dangerouslySetInnerHTML={{ __html: parseRedlineText(r.theirs) }}
                    />
                  </div>
                </div>
                {r.comment && (
                  <p className="mt-2 text-xs italic" style={{ color: "var(--color-gray-400)" }}>
                    {r.comment}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
