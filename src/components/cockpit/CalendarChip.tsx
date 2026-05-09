"use client";

import { useEffect, useState } from "react";
import { Clock, AlertCircle } from "lucide-react";

interface CalendarChipProps {
  nextHardStop: string;
  eventTitle?: string;
}

function getCountdown(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { h: 0, m: 0, s: 0, urgent: true };
  const s = Math.floor(diff / 1000) % 60;
  const m = Math.floor(diff / 60000) % 60;
  const h = Math.floor(diff / 3600000);
  return { h, m, s, urgent: h === 0 && m < 30 };
}

export function CalendarChip({ nextHardStop, eventTitle = "Board readout" }: CalendarChipProps) {
  const [countdown, setCountdown] = useState(getCountdown(nextHardStop));

  useEffect(() => {
    const id = setInterval(() => setCountdown(getCountdown(nextHardStop)), 1000);
    return () => clearInterval(id);
  }, [nextHardStop]);

  const { h, m, s, urgent } = countdown;

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
      style={{
        background: urgent ? "rgba(255,59,48,0.08)" : "rgba(255,184,0,0.08)",
        border: `1px solid ${urgent ? "rgba(255,59,48,0.25)" : "rgba(255,184,0,0.25)"}`,
        color: urgent ? "var(--color-error)" : "var(--color-warning)",
      }}
      role="timer"
      aria-label={`${eventTitle} deadline`}
    >
      {urgent ? <AlertCircle size={14} /> : <Clock size={14} />}
      <span className="font-mono">
        {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </span>
      <span className="text-xs font-medium" style={{ opacity: 0.8 }}>
        to {eventTitle}
      </span>
    </div>
  );
}
