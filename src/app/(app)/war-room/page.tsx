"use client";

import { useEffect, useState, useCallback } from "react";
import { CouncilRing } from "@/components/war-room/CouncilRing";
import { DebateBubble } from "@/components/war-room/DebateBubble";
import { DEMO_DEBATE_EVENTS } from "@/lib/fixtures/demo";
import type { CouncilRole, DebateEvent, VoteValue } from "@/lib/contracts/models";
import { Play, RotateCcw, Users } from "lucide-react";

export default function WarRoomPage() {
  const [events, setEvents] = useState<DebateEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [influences, setInfluences] = useState<Record<CouncilRole, number>>({
    counsel: 0, closer: 0, counterpart: 0, compliance: 0, crown: 0,
  });
  const [votes, setVotes] = useState<Partial<Record<CouncilRole, VoteValue>>>({});
  const [aiVsAi, setAiVsAi] = useState(false);

  const playCouncil = useCallback(() => {
    setEvents([]);
    setInfluences({ counsel: 0, closer: 0, counterpart: 0, compliance: 0, crown: 0 });
    setVotes({});
    setRunning(true);

    let i = 0;
    const id = setInterval(() => {
      if (i >= DEMO_DEBATE_EVENTS.length) {
        clearInterval(id);
        setRunning(false);
        return;
      }
      const ev = DEMO_DEBATE_EVENTS[i];
      setEvents((prev) => [...prev, ev]);
      if (ev.vote) setVotes((prev) => ({ ...prev, [ev.agent]: ev.vote }));
      if (ev.influenceDelta) {
        setInfluences((prev) => ({
          ...prev,
          [ev.agent]: (prev[ev.agent] ?? 0) + ev.influenceDelta!,
        }));
      }
      i++;
    }, 1400);
  }, []);

  const activeAgent = events.length > 0 && running
    ? events[events.length - 1].agent
    : undefined;

  const finalEvent = events[events.length - 1];
  const isCrownjudgement = finalEvent?.agent === "crown" && finalEvent?.vote === "clear";

  return (
    <div className="flex h-full" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Main council area */}
      <div className="flex-1 flex flex-col items-center justify-start p-8 overflow-y-auto">
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users size={18} style={{ color: "var(--color-brand)" }} />
              <div>
                <h1 className="font-bold text-lg" style={{ color: "var(--color-gray-900)", letterSpacing: "-0.03em" }}>
                  War Room
                </h1>
                <p className="text-xs" style={{ color: "var(--color-gray-400)" }}>
                  Multi-agent council deliberating Move A
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAiVsAi(!aiVsAi)}
                className="text-xs px-3 py-1.5 rounded-full border font-medium transition-colors"
                style={{
                  borderColor: aiVsAi ? "var(--color-brand)" : "var(--color-gray-200)",
                  color: aiVsAi ? "var(--color-brand)" : "var(--color-gray-600)",
                  background: aiVsAi ? "var(--color-brand-muted)" : "transparent",
                }}
              >
                AI vs AI {aiVsAi ? "ON" : "OFF"}
              </button>
              <button
                onClick={playCouncil}
                disabled={running}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all"
                style={{
                  background: running ? "var(--color-gray-400)" : "linear-gradient(135deg, #FF4B00, #FF7A40)",
                  boxShadow: running ? "none" : "0 4px 12px rgba(255,75,0,0.3)",
                }}
              >
                {running ? <RotateCcw size={14} className="animate-spin" /> : <Play size={14} />}
                {running ? "Deliberating…" : events.length > 0 ? "Replay" : "Start Council"}
              </button>
            </div>
          </div>

          <div className="flex gap-8 items-start">
            {/* Council ring */}
            <div className="shrink-0">
              <CouncilRing
                events={events}
                influences={influences}
                votes={votes}
                activeAgent={activeAgent}
              />
            </div>

            {/* Influence meters + vote tally */}
            <div className="flex-1 space-y-4">
              {/* Vote tally */}
              {Object.keys(votes).length > 0 && (
                <div className="rounded-2xl border p-4" style={{ borderColor: "var(--color-gray-200)", background: "white" }}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-gray-400)" }}>
                    Vote Tally — Move A
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(votes) as [CouncilRole, VoteValue][]).map(([role, vote]) => (
                      <div
                        key={role}
                        className="text-center p-2 rounded-xl"
                        style={{ background: "var(--color-gray-50)", border: "1px solid var(--color-gray-200)" }}
                      >
                        <p className="text-xs capitalize font-semibold" style={{ color: "var(--color-gray-600)" }}>{role}</p>
                        <p className="text-sm font-bold mt-0.5 capitalize" style={{
                          color: vote === "accept" || vote === "clear" ? "var(--color-success)" : vote === "reject" ? "var(--color-error)" : "var(--color-warning)"
                        }}>
                          {vote.replace(/_/g, " ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Crown synthesis */}
              {isCrownjudgement && (
                <div
                  className="rounded-2xl p-4"
                  style={{ background: "linear-gradient(135deg, #8B5CF620, #6366F110)", border: "1px solid #8B5CF640" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#8B5CF6" }}>
                    Crown Synthesis — 4–0
                  </p>
                  <p className="text-sm font-semibold" style={{ color: "var(--color-gray-900)" }}>
                    {finalEvent.message}
                  </p>
                </div>
              )}

              {/* AI vs AI arena */}
              {aiVsAi && (
                <div
                  className="rounded-2xl border p-4"
                  style={{ borderColor: "var(--color-gray-200)", background: "white" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-gray-400)" }}>
                    AI vs AI — MSA §7.1 Liability Cap
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="p-3 rounded-xl" style={{ background: "rgba(255,75,0,0.05)", border: "1px solid rgba(255,75,0,0.2)" }}>
                      <p className="text-xs font-bold" style={{ color: "var(--color-brand)" }}>Dunder Founder</p>
                      <p className="text-xs mt-1" style={{ color: "var(--color-gray-600)" }}>
                        "24-month cap is our maximum exposure ceiling. We can offer uncapped exclusion for gross negligence only."
                      </p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <p className="text-xs font-bold" style={{ color: "#EF4444" }}>Initech Hardline</p>
                      <p className="text-xs mt-1" style={{ color: "var(--color-gray-600)" }}>
                        "Data breach liability cannot be capped. Our OSFI posture requires uncapped exposure for AI vendors."
                      </p>
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: "var(--color-gray-400)" }}>
                    Preset clause: MSA §7.1 · Enable full AI-vs-AI mode via T5 integration
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Debate feed */}
      <div
        className="w-80 flex flex-col overflow-y-auto p-4 gap-3"
        style={{ borderLeft: "1px solid var(--color-gray-200)", background: "white" }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-gray-400)" }}>
          Debate Feed
        </p>
        {events.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--color-gray-400)" }}>
            Press Start Council to begin deliberation.
          </p>
        ) : (
          events.map((ev, i) => <DebateBubble key={`${ev.agent}-${i}`} event={ev} index={i} />)
        )}
      </div>
    </div>
  );
}
