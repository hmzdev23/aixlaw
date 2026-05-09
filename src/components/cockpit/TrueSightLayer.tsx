"use client";

import { useState } from "react";
import type { TrueSightResult } from "@/lib/contracts/models";
import { Eye, CheckCircle } from "lucide-react";

interface TrueSightLayerProps {
  result: TrueSightResult;
}

export function TrueSightLayer({ result }: TrueSightLayerProps) {
  const [revealed, setRevealed] = useState(false);

  const hasClaims = result.claims.length > 0;

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: "var(--color-gray-200)", background: "white" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Eye size={14} style={{ color: "var(--color-brand)" }} />
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-gray-900)" }}>
            TrueSight
          </p>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            background: result.status === "clean" ? "rgba(0,196,140,0.1)" : "rgba(255,59,48,0.08)",
            color: result.status === "clean" ? "var(--color-success)" : "var(--color-error)",
          }}
        >
          {result.status === "clean" ? "Clean" : result.status === "substituted" ? "Corrected" : "Unverified"}
        </span>
      </div>

      {hasClaims && result.claims.map((claim, i) => (
        <div key={i} className="mb-3">
          <div className="p-2 rounded-lg mb-2" style={{ background: "rgba(255,59,48,0.04)", border: "1px solid rgba(255,59,48,0.15)" }}>
            <p className="text-xs" style={{ color: "var(--color-gray-600)" }}>
              <s style={{ color: "var(--color-error)", textDecorationColor: "var(--color-error)" }}>
                {claim.original}
              </s>
            </p>
            <span
              className="inline-flex items-center gap-1 mt-1 text-xs px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,59,48,0.1)", color: "var(--color-error)" }}
            >
              Hallucination caught
            </span>
          </div>

          {claim.verified && (
            <div
              className="p-2 rounded-lg"
              style={{ background: "rgba(0,196,140,0.06)", border: "1px solid rgba(0,196,140,0.2)" }}
            >
              <div className="flex items-start gap-1.5">
                <CheckCircle size={12} style={{ color: "var(--color-success)", marginTop: 1 }} />
                <div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-gray-900)" }}>
                    {claim.verified}
                  </p>
                  {claim.sourceUrl && (
                    <p className="text-xs mt-0.5 font-mono truncate" style={{ color: "var(--color-gray-400)" }}>
                      {claim.sourceUrl}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {!hasClaims && (
        <p className="text-xs" style={{ color: "var(--color-gray-400)" }}>
          No citation issues detected in current draft.
        </p>
      )}

      <button
        onClick={() => setRevealed(!revealed)}
        className="mt-2 text-xs font-medium"
        style={{ color: "var(--color-brand)" }}
      >
        {revealed ? "Hide" : "Show"} full analysis
      </button>

      {revealed && (
        <div className="mt-2 p-2 rounded-lg text-xs" style={{ background: "var(--color-gray-50)", color: "var(--color-gray-600)" }}>
          TrueSight cross-references citations against CanLII database and SCC decisions. Substituted citations are replaced with verified equivalents before any outbound document is generated.
        </div>
      )}
    </div>
  );
}
