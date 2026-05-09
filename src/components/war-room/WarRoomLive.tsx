"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Gavel, Play, RotateCcw, Swords } from "lucide-react";
import { CouncilRing } from "@/components/war-room/CouncilRing";
import { DebateBubble } from "@/components/war-room/DebateBubble";
import { useAiVsAiStream } from "@/hooks/useAiVsAiStream";
import { useCouncilStream } from "@/hooks/useCouncilStream";
import type { DebateEvent } from "@/lib/contracts/models";

const MOVE_OPTIONS = [
  {
    id: "n_a_brilliant",
    label: "Move A",
    title: "Cap breach carve-out; preserve platform IP",
  },
  {
    id: "n_b_interesting",
    label: "Move B",
    title: "Accept audit rights; trade on cure windows",
  },
  {
    id: "n_c_blunder",
    label: "Move C",
    title: "Concede convenience termination",
  },
] as const;

function agentLabel(agent: DebateEvent["agent"]) {
  return agent === "counterpart_left"
    ? "Initech Hardline"
    : agent === "counterpart_right"
      ? "Dunder Founder"
      : agent;
}

export function WarRoomLive({ dealId, initialFlex = false }: { dealId: string; initialFlex?: boolean }) {
  const [flex, setFlex] = useState(initialFlex);
  const council = useCouncilStream(dealId, MOVE_OPTIONS[0].id);
  const ai = useAiVsAiStream();

  useEffect(() => {
    void council.start(MOVE_OPTIONS[0].id);
    // Run once on mount for demo replay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId]);

  useEffect(() => {
    if (flex && ai.events.length === 0 && !ai.running) void ai.start();
  }, [ai, flex]);

  const latestCrown = useMemo(
    () => council.result?.finalRecommendation ?? council.events.findLast((e) => e.agent === "crown")?.message,
    [council.events, council.result],
  );

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-[var(--hairline)] bg-[#0c0a09] text-white shadow-[0_24px_70px_rgba(12,10,9,0.24)]">
      <div className="pointer-events-none absolute -left-16 -top-24 h-72 w-72 rounded-full bg-[var(--grad-lavender)] opacity-25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-8 h-80 w-80 rounded-full bg-[var(--grad-mint)] opacity-20 blur-3xl" />

      <div className="relative grid min-h-[660px] grid-cols-1 lg:grid-cols-[minmax(420px,1fr)_360px]">
        <section className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r lg:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="caption-upper text-white/50">War Room</p>
              <h2 className="font-display mt-2 text-[40px] leading-none text-white">
                Council live stream
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
                Counsel, Closer, Counterpart, Compliance, and Crown debate the
                selected move. The feed below is parsed directly from
                `POST /api/engine/council`.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFlex((v) => !v)}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/80 hover:bg-white/10"
              >
                <Swords className="h-4 w-4" />
                {flex ? "Council view" : "AI-vs-AI"}
              </button>
              <button
                type="button"
                onClick={() => void council.start(council.moveId)}
                disabled={council.running}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-[#0c0a09] disabled:opacity-60"
              >
                {council.running ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Replay
              </button>
            </div>
          </div>

          {!flex ? (
            <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
              <div className="rounded-[24px] bg-white p-4 text-[var(--ink)]">
                <CouncilRing
                  activeAgent={council.activeAgent}
                  events={council.events}
                  influences={council.influences}
                  votes={council.votes}
                />
              </div>

              <div>
                <div className="mb-4 grid grid-cols-3 gap-2">
                  {MOVE_OPTIONS.map((move) => (
                    <button
                      key={move.id}
                      type="button"
                      onClick={() => void council.start(move.id)}
                      className={`rounded-2xl border px-3 py-3 text-left transition ${
                        council.moveId === move.id
                          ? "border-white bg-white text-[#0c0a09]"
                          : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      <p className="text-xs font-semibold">{move.label}</p>
                      <p className="mt-1 text-[11px] leading-4 opacity-75">{move.title}</p>
                    </button>
                  ))}
                </div>

                <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-[24px] border border-white/10 bg-black/20 p-4">
                  {council.events.map((event, index) => (
                    <div key={`${event.agent}-${event.t}-${index}`} className="[&_*]:!text-white">
                      <DebateBubble event={event} index={index} />
                    </div>
                  ))}
                  {council.error ? <p className="text-sm text-red-300">{council.error}</p> : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-[1fr_320px_1fr]">
              {["counterpart_left", "counterpart_right"].map((side) => (
                <div key={side} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="caption-upper text-white/50">
                    {side === "counterpart_left" ? "Initech Hardline" : "Dunder Founder"}
                  </p>
                  <div className="mt-4 space-y-3">
                    {ai.events
                      .filter((e) => e.agent === side)
                      .map((event, index) => (
                        <motion.div
                          key={`${event.agent}-${event.t}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-[#292524]"
                        >
                          {event.message}
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
              <div className="order-first rounded-[24px] bg-white p-5 text-[#292524] xl:order-none">
                <div className="mb-4 flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <p className="text-sm font-semibold">MSA §7.1 flex clause</p>
                </div>
                <p className="text-sm leading-6 text-[#4e4e4e]">{ai.clauseText}</p>
                <button
                  type="button"
                  onClick={() => void ai.start()}
                  disabled={ai.running}
                  className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-full bg-[#0c0a09] text-sm font-medium text-white disabled:opacity-60"
                >
                  {ai.running ? "Negotiating…" : ai.events.length ? "Replay AI-vs-AI" : "Start AI-vs-AI"}
                </button>
                {ai.error ? <p className="mt-3 text-xs text-red-600">{ai.error}</p> : null}
              </div>
            </div>
          )}
        </section>

        <aside className="relative p-6 lg:p-8">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Gavel className="h-4 w-4 text-white/70" />
              <p className="text-sm font-semibold">Crown synthesis</p>
            </div>
            <p className="text-sm leading-6 text-white/70">
              {latestCrown ?? "Waiting for Crown to synthesize the agent votes."}
            </p>
          </div>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="caption-upper text-white/50">Vote tally</p>
            <div className="mt-4 space-y-2">
              {Object.entries(council.votes).map(([agent, vote]) => (
                <div key={agent} className="flex items-center justify-between rounded-full bg-white/10 px-3 py-2 text-sm">
                  <span className="capitalize text-white/75">{agent}</span>
                  <span className="font-medium capitalize text-white">{vote?.replaceAll("_", " ")}</span>
                </div>
              ))}
              {Object.keys(council.votes).length === 0 ? (
                <p className="text-sm text-white/45">No votes streamed yet.</p>
              ) : null}
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="caption-upper text-white/50">Latest speakers</p>
            <div className="mt-4 space-y-2">
              {[...council.events, ...ai.events].slice(-5).reverse().map((event, index) => (
                <div key={`${event.agent}-${event.t}-${index}`} className="rounded-2xl bg-white/10 px-3 py-2 text-xs text-white/75">
                  <span className="font-semibold text-white">{agentLabel(event.agent)}:</span>{" "}
                  {event.message.slice(0, 90)}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
