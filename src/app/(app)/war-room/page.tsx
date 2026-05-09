"use client";

import { useEffect, useState, useCallback } from "react";
import { CouncilRing } from "@/components/war-room/CouncilRing";
import { DebateBubble } from "@/components/war-room/DebateBubble";
import { DEMO_DEBATE_EVENTS } from "@/lib/fixtures/demo";
import type {
  CouncilRole,
  DebateAgent,
  DebateEvent,
  VoteValue,
} from "@/lib/contracts/models";

const COUNCIL_ROLES: readonly CouncilRole[] = [
  "counsel",
  "closer",
  "counterpart",
  "compliance",
  "crown",
] as const;

function isCouncilRole(agent: DebateAgent): agent is CouncilRole {
  return (COUNCIL_ROLES as readonly string[]).includes(agent);
}
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
      const agent = ev.agent;
      setEvents((prev) => [...prev, ev]);
      if (ev.vote && isCouncilRole(agent)) {
        const role = agent;
        setVotes((prev) => ({ ...prev, [role]: ev.vote }));
      }
      if (ev.influenceDelta && isCouncilRole(agent)) {
        const role = agent;
        setInfluences((prev) => ({
          ...prev,
          [role]: (prev[role] ?? 0) + ev.influenceDelta!,
        }));
      }
      i++;
    }, 1400);
  }, []);

  const lastAgent =
    events.length > 0 && running ? events[events.length - 1].agent : undefined;
  const activeAgent =
    lastAgent && isCouncilRole(lastAgent) ? lastAgent : undefined;

  const finalEvent = events[events.length - 1];
  const isCrownjudgement = finalEvent?.agent === "crown" && finalEvent?.vote === "clear";

  return (
    <div className="flex h-full bg-[#f5f5f5]" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Main council area */}
      <div className="flex-1 flex flex-col items-center justify-start p-6 overflow-y-auto bg-white border-r border-[#e7e5e4]">
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users size={18} style={{ color: "var(--color-brand)" }} />
              <div>
                <h1 className="text-[20px] font-medium text-[#0c0a09]">
                  War Room
                </h1>
                <p className="text-[14px] text-[#777169] mt-0.5">
                  Multi-agent council deliberating Move A
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAiVsAi(!aiVsAi)}
                className={`px-4 py-2 rounded-full border text-[15px] font-medium transition-colors ${
                  aiVsAi
                    ? "border-[#e7e5e4] bg-[#f0efed] text-[#0c0a09]"
                    : "border-[#e7e5e4] bg-transparent text-[#777169]"
                }`}
              >
                AI vs AI {aiVsAi ? "ON" : "OFF"}
              </button>
              <button
                onClick={playCouncil}
                disabled={running}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[15px] font-medium text-white transition-colors ${
                  running ? "bg-[#a8a29e]" : "bg-[#0c0a09]"
                }`}
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
                <div className="bg-[#f5f5f5] border border-[#e7e5e4] rounded-xl p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-widest text-[#777169] mb-3">
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
                <div className="bg-[#f0efed] border border-[#e7e5e4] rounded-xl p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-widest text-[#777169] mb-1">
                    Crown Synthesis — 4–0
                  </p>
                  <p className="text-sm font-semibold text-zinc-900">
                    {finalEvent.message}
                  </p>
                </div>
              )}

              {/* AI vs AI arena */}
              {aiVsAi && (
                <div className="bg-[#f5f5f5] border border-[#e7e5e4] rounded-xl p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-widest text-[#777169] mb-3">
                    AI vs AI — MSA §7.1 Liability Cap
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white border border-[#e7e5e4] rounded-xl p-3">
                      <p className="text-xs font-bold text-[#0c0a09]">Dunder Founder</p>
                      <p className="text-xs mt-1 text-[#4e4e4e]">
                        &ldquo;24-month cap is our maximum exposure ceiling. We can offer uncapped exclusion for gross negligence only.&rdquo;
                      </p>
                    </div>
                    <div className="bg-[#f0efed] border border-[#e7e5e4] rounded-xl p-3">
                      <p className="text-xs font-bold text-[#0c0a09]">Initech Hardline</p>
                      <p className="text-xs mt-1 text-[#4e4e4e]">
                        &ldquo;Data breach liability cannot be capped. Our OSFI posture requires uncapped exposure for AI vendors.&rdquo;
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#777169]">
                    Preset clause: MSA §7.1 · Enable full AI-vs-AI mode via T5 integration
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Debate feed */}
      <div className="w-80 flex flex-col p-4 gap-3 overflow-y-auto bg-[#f5f5f5] border-l border-[#e7e5e4]">
        <p className="text-[12px] font-semibold uppercase tracking-widest text-[#777169] mb-1">
          Debate Feed
        </p>
        {events.length === 0 ? (
          <p className="text-sm text-[#777169]">
            Press Start Council to begin deliberation.
          </p>
        ) : (
          events.map((ev, i) => <DebateBubble key={`${ev.agent}-${i}`} event={ev} index={i} />)
        )}
      </div>
    </div>
  );
}
