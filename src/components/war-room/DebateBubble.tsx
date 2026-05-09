"use client";

import { motion } from "framer-motion";
import type { DebateEvent } from "@/lib/contracts/models";

const AGENT_COLORS: Record<string, string> = {
  counsel: "#6366F1",
  closer: "#FF4B00",
  counterpart: "#EF4444",
  compliance: "#F59E0B",
  crown: "#8B5CF6",
};

const VOTE_LABELS: Record<string, string> = {
  accept: "Accept ✓",
  reject: "Reject ✗",
  likely_counter_accept: "Likely Accept ~",
  clear: "Clear ◆",
  abstain: "Abstain",
};

interface DebateBubbleProps {
  event: DebateEvent;
  index: number;
}

export function DebateBubble({ event, index }: DebateBubbleProps) {
  const color = AGENT_COLORS[event.agent] ?? "var(--color-gray-400)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 120, damping: 18 }}
      className="flex gap-3"
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
        style={{ background: color }}
      >
        {event.agent[0].toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold capitalize" style={{ color }}>
            {event.agent}
          </span>
          {event.vote && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: `${color}20`, color }}
            >
              {VOTE_LABELS[event.vote]}
            </span>
          )}
          {event.influenceDelta !== undefined && (
            <span className="text-xs" style={{ color: "var(--color-gray-400)" }}>
              +{event.influenceDelta.toFixed(1)} influence
            </span>
          )}
        </div>
        <div
          className="rounded-2xl rounded-tl-none px-3 py-2 text-xs leading-relaxed"
          style={{ background: `${color}10`, color: "var(--color-gray-900)" }}
        >
          {event.message}
        </div>
      </div>
    </motion.div>
  );
}
