"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { CouncilRole, DebateEvent, VoteValue } from "@/lib/contracts/models";
import {
  Scale,
  TrendingUp,
  Users,
  Shield,
  Crown,
} from "lucide-react";

const AGENT_META: Record<CouncilRole, { label: string; icon: typeof Scale; color: string; angle: number }> = {
  counsel:    { label: "Counsel",    icon: Scale,      color: "#6366F1", angle: 90 },
  closer:     { label: "Closer",     icon: TrendingUp, color: "#FF4B00", angle: 162 },
  counterpart:{ label: "Counterpart",icon: Users,      color: "#EF4444", angle: 234 },
  compliance: { label: "Compliance", icon: Shield,     color: "#F59E0B", angle: 306 },
  crown:      { label: "Crown",      icon: Crown,      color: "#8B5CF6", angle: 18 },
};

const VOTE_COLORS: Record<VoteValue, string> = {
  accept: "var(--color-success)",
  reject: "var(--color-error)",
  likely_counter_accept: "var(--color-warning)",
  clear: "#8B5CF6",
  abstain: "var(--color-gray-400)",
};

interface CouncilRingProps {
  events: DebateEvent[];
  influences: Record<CouncilRole, number>;
  votes: Partial<Record<CouncilRole, VoteValue>>;
  activeAgent?: CouncilRole;
}

export function CouncilRing({ events, influences, votes, activeAgent }: CouncilRingProps) {
  const RADIUS = 140;
  const CENTER = 200;

  return (
    <div className="relative" style={{ width: CENTER * 2, height: CENTER * 2 }}>
      {/* SVG ring */}
      <svg
        width={CENTER * 2}
        height={CENTER * 2}
        className="absolute inset-0"
        aria-hidden="true"
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--color-gray-200)"
          strokeWidth={1}
          strokeDasharray="6 4"
        />
      </svg>

      {/* Agent nodes */}
      {(Object.entries(AGENT_META) as [CouncilRole, typeof AGENT_META.crown][]).map(([role, meta]) => {
        const rad = (meta.angle * Math.PI) / 180;
        const x = CENTER + RADIUS * Math.cos(rad);
        const y = CENTER + RADIUS * Math.sin(rad);
        const Icon = meta.icon;
        const isActive = activeAgent === role;
        const vote = votes[role];

        return (
          <motion.div
            key={role}
            className="absolute flex flex-col items-center gap-1"
            style={{
              left: x - 40,
              top: y - 40,
              width: 80,
            }}
            animate={isActive ? { scale: 1.1 } : { scale: 1 }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center relative"
              style={{
                background: isActive ? meta.color : "white",
                border: `2px solid ${meta.color}`,
                boxShadow: isActive ? `0 0 20px ${meta.color}40` : "none",
              }}
            >
              <Icon size={20} color={isActive ? "white" : meta.color} />
              {vote && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: VOTE_COLORS[vote] }}
                  aria-label={`Vote: ${vote}`}
                >
                  {vote === "accept" ? "✓" : vote === "reject" ? "✗" : "~"}
                </motion.span>
              )}
            </div>
            <span
              className="text-xs font-semibold text-center"
              style={{ color: isActive ? meta.color : "var(--color-gray-600)" }}
            >
              {meta.label}
            </span>
            {/* Influence bar */}
            <div
              className="w-10 h-1 rounded-full overflow-hidden"
              style={{ background: "var(--color-gray-200)" }}
            >
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${Math.min(100, (influences[role] ?? 0) * 25)}%` }}
                style={{ background: meta.color }}
              />
            </div>
          </motion.div>
        );
      })}

      {/* Center: latest message */}
      <div
        className="absolute flex items-center justify-center rounded-full text-center px-4"
        style={{
          left: CENTER - 60,
          top: CENTER - 40,
          width: 120,
          height: 80,
        }}
      >
        {events.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.p
              key={events[events.length - 1].t}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xs leading-tight text-center"
              style={{ color: "var(--color-gray-600)" }}
            >
              {events[events.length - 1].message.slice(0, 60)}…
            </motion.p>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
