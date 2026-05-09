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
    <div className="flex h-full bg-zinc-50" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Main council area */}
      <div className="flex-1 flex flex-col items-center justify-start p-6 overflow-y-auto bg-white border-r border-zinc-200">
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users size={18} style={{ color: "var(--color-brand)" }} />
              <div>
                <h1 className="font-bold text-lg text-zinc-900" style={{ letterSpacing: "-0.03em" }}>
                  War Room
                </h1>
                <p className="text-xs text-zinc-400">
                  Multi-agent council deliberating Move A
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAiVsAi(!aiVsAi)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  aiVsAi
                    ? "border-orange-200 bg-orange-50 text-orange-600"
                    : "border-zinc-200 bg-white text-zinc-600"
                }`}
              >
                AI vs AI {aiVsAi ? "ON" : "OFF"}
              </button>
              <button
                onClick={playCouncil}
                disabled={running}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all"
                style={{
                  background: running ? "#d4d4d8" : "#18181b",
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
                <div className="rounded-[1.25rem] border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-3">
                    Vote Tally — Move A
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(votes) as [CouncilRole, VoteValue][]).map(([role, vote]) => (
                      <div
                        key={role}
                        className="text-center p-2 rounded-xl bg-white border border-zinc-200"
                      >
                        <p className="text-xs capitalize font-semibold text-zinc-600">{role}</p>
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
                <div className="rounded-[1.25rem] border border-violet-200 bg-violet-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-widest text-violet-600 mb-1">
                    Crown Synthesis — 4–0
                  </p>
                  <p className="text-sm font-semibold text-zinc-900">
                    {finalEvent.message}
                  </p>
                </div>
              )}

              {/* AI vs AI arena */}
              {aiVsAi && (
                <div className="rounded-[1.25rem] border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-3">
                    AI vs AI — MSA §7.1 Liability Cap
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="p-3 rounded-xl" style={{ background: "rgba(255,75,0,0.05)", border: "1px solid rgba(255,75,0,0.2)" }}>
                      <p className="text-xs font-bold" style={{ color: "var(--color-brand)" }}>Dunder Founder</p>
                      <p className="text-xs mt-1 text-zinc-600">
                        "24-month cap is our maximum exposure ceiling. We can offer uncapped exclusion for gross negligence only."
                      </p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <p className="text-xs font-bold" style={{ color: "#EF4444" }}>Initech Hardline</p>
                      <p className="text-xs mt-1 text-zinc-600">
                        "Data breach liability cannot be capped. Our OSFI posture requires uncapped exposure for AI vendors."
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Preset clause: MSA §7.1 · Enable full AI-vs-AI mode via T5 integration
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Debate feed */}
      <div className="w-80 flex flex-col p-4 gap-3 overflow-y-auto bg-zinc-50">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-1">
          Debate Feed
        </p>
        {events.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Press Start Council to begin deliberation.
          </p>
        ) : (
          events.map((ev, i) => <DebateBubble key={`${ev.agent}-${i}`} event={ev} index={i} />)
        )}
      </div>
    </div>
  );
}
