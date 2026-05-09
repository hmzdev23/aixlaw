"use client";

import { motion } from "framer-motion";

interface EvalBarProps {
  score: number; // -4 to +4
  onPreviewScore?: (s: number) => void;
}

export function EvalBar({ score }: EvalBarProps) {
  const normalized = Math.max(-4, Math.min(4, score));
  const pct = ((normalized + 4) / 8) * 100;
  const isPositive = normalized >= 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-gray-400)" }}>
        Deal Score
      </p>
      <div
        className="relative w-4 rounded-full overflow-hidden"
        style={{ height: 180, background: "var(--color-gray-100)" }}
        role="meter"
        aria-valuenow={normalized}
        aria-valuemin={-4}
        aria-valuemax={4}
        aria-label={`Deal score: ${normalized.toFixed(1)}`}
      >
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-full"
          animate={{ height: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          style={{
            background: isPositive
              ? "linear-gradient(0deg, var(--color-success), #00E0A0)"
              : "linear-gradient(0deg, var(--color-error), #FF7070)",
          }}
        />
      </div>
      <span
        className="text-lg font-bold tabular-nums"
        style={{ color: isPositive ? "var(--color-success)" : "var(--color-error)" }}
      >
        {normalized > 0 ? "+" : ""}
        {normalized.toFixed(1)}
      </span>
    </div>
  );
}
