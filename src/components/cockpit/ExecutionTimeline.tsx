"use client";

import { useEffect, useState } from "react";
import type { TimelineEvent } from "@/lib/contracts/models";
import { CheckCircle, Circle, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const STEP_LABELS: Record<string, string> = {
  email_received: "Email Received",
  counter_sent: "Counter Sent",
  invoice_generated: "Invoice Generated (CAD)",
  seats_provisioned: "Seats Provisioned",
  notary_queued: "Notary Queue",
};

interface ExecutionTimelineProps {
  events: TimelineEvent[];
  animate?: boolean;
}

export function ExecutionTimeline({ events, animate = false }: ExecutionTimelineProps) {
  const [displayed, setDisplayed] = useState(animate ? [] as TimelineEvent[] : events);

  useEffect(() => {
    if (!animate) { setDisplayed(events); return; }
    let i = 0;
    const id = setInterval(() => {
      if (i >= events.length) { clearInterval(id); return; }
      setDisplayed((prev) => [...prev, events[i]]);
      i++;
    }, 800);
    return () => clearInterval(id);
  }, [animate, events]);

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1" role="list" aria-label="Execution timeline">
      {events.map((ev, idx) => {
        const shown = displayed.find((d) => d.step === ev.step);
        const status = shown?.status ?? "pending";

        return (
          <div key={ev.step} className="flex items-center shrink-0" role="listitem">
            <motion.div
              initial={animate ? { opacity: 0, scale: 0.8 } : {}}
              animate={shown ? { opacity: 1, scale: 1 } : {}}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex flex-col items-center gap-1 min-w-[90px]"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full"
                style={{
                  background: status === "done" ? "rgba(0,196,140,0.12)" : status === "error" ? "rgba(255,59,48,0.08)" : "var(--color-gray-100)",
                }}>
                {status === "done" ? (
                  <CheckCircle size={16} style={{ color: "var(--color-success)" }} />
                ) : status === "error" ? (
                  <AlertCircle size={16} style={{ color: "var(--color-error)" }} />
                ) : shown ? (
                  <Loader2 size={16} style={{ color: "var(--color-gray-400)" }} className="animate-spin" />
                ) : (
                  <Circle size={16} style={{ color: "var(--color-gray-300)" }} />
                )}
              </div>
              <p className="text-xs text-center leading-tight" style={{ color: status === "done" ? "var(--color-gray-900)" : "var(--color-gray-400)", maxWidth: 80 }}>
                {STEP_LABELS[ev.step]}
              </p>
              {shown?.at && (
                <p className="text-xs font-mono" style={{ color: "var(--color-gray-400)" }}>
                  {new Date(shown.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </motion.div>

            {idx < events.length - 1 && (
              <div
                className="h-px w-6 shrink-0 mx-1"
                style={{ background: status === "done" ? "var(--color-success)" : "var(--color-gray-200)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
