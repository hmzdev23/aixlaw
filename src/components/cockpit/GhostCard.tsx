"use client";

import { motion } from "framer-motion";
import { Zap, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import type { GhostProfile } from "@/lib/contracts/models";

interface GhostCardProps {
  ghost: GhostProfile;
}

export function GhostCard({ ghost }: GhostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 18 }}
      className="rounded-2xl border p-5 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)",
        borderColor: "rgba(255,75,0,0.3)",
      }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: "linear-gradient(90deg, #FF4B00, #FF7A40)" }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-brand)" }}>
            Opponent Ghost
          </p>
          <h3 className="font-bold text-base text-white leading-tight">{ghost.displayName}</h3>
          <p className="text-xs mt-0.5" style={{ color: "#A0A0A0" }}>
            {ghost.styleLabel}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <Zap size={12} style={{ color: "var(--color-warning)" }} />
            <span className="font-bold text-sm" style={{ color: "var(--color-warning)" }}>
              ELO {ghost.elo}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: "#666" }}>{ghost.trainingSummary}</p>
        </div>
      </div>

      {/* Playstyle */}
      <p className="text-xs mb-4 leading-relaxed" style={{ color: "#A0A0A0" }}>
        {ghost.playstyle}
      </p>

      {/* Fights on */}
      <div className="mb-3">
        <div className="flex items-center gap-1 mb-1.5">
          <TrendingUp size={11} style={{ color: "var(--color-error)" }} />
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-error)" }}>
            Fights on
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {ghost.fightsOn.map((f) => (
            <span
              key={f}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,59,48,0.15)", color: "#FF7070", border: "1px solid rgba(255,59,48,0.2)" }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Often concedes */}
      <div className="mb-3">
        <div className="flex items-center gap-1 mb-1.5">
          <TrendingDown size={11} style={{ color: "var(--color-success)" }} />
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-success)" }}>
            Often concedes
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {ghost.oftenConcedes.map((f) => (
            <span
              key={f}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "rgba(0,196,140,0.12)", color: "#00C48C", border: "1px solid rgba(0,196,140,0.2)" }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Walks when */}
      <div>
        <div className="flex items-center gap-1 mb-1.5">
          <AlertTriangle size={11} style={{ color: "var(--color-warning)" }} />
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-warning)" }}>
            Walks when
          </p>
        </div>
        <ul className="space-y-1">
          {ghost.walksWhen.map((w) => (
            <li key={w} className="text-xs" style={{ color: "#A0A0A0" }}>
              · {w}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
