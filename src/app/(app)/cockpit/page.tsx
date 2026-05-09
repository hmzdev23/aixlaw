"use client";

import { useState } from "react";
import { RedlinePile } from "@/components/cockpit/RedlinePile";
import { EvalBar } from "@/components/cockpit/EvalBar";
import { GhostCard } from "@/components/cockpit/GhostCard";
import { GameTreeBoard } from "@/components/cockpit/GameTreeBoard";
import { WalkawayLine } from "@/components/cockpit/WalkawayLine";
import { CalendarChip } from "@/components/cockpit/CalendarChip";
import { TrueSightLayer } from "@/components/cockpit/TrueSightLayer";
import { CompliancePanel } from "@/components/cockpit/CompliancePanel";
import { ExecutionTimeline } from "@/components/cockpit/ExecutionTimeline";
import { VoiceSignoff } from "@/components/cockpit/VoiceSignoff";
import {
  DEMO_GHOST,
  DEMO_GAME_TREE,
  DEMO_MSA_REDLINES,
  DEMO_NDA_REDLINES,
  DEMO_WALKAWAY,
  DEMO_COMPLIANCE,
  DEMO_TIMELINE,
} from "@/lib/fixtures/demo";
import { ChevronRight, Zap, FileText, FileCheck } from "lucide-react";

// Board readout hard stop — 6 PM today
const HARD_STOP = (() => {
  const d = new Date();
  d.setHours(18, 0, 0, 0);
  return d.toISOString();
})();

export default function CockpitPage() {
  const [docMode, setDocMode] = useState<"msa" | "nda">("msa");
  const [selectedRedline, setSelectedRedline] = useState<string | undefined>();
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [evalScore, setEvalScore] = useState(DEMO_GAME_TREE.evalScore);
  const [bestLinePlayed, setBestLinePlayed] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [timelineAnimate, setTimelineAnimate] = useState(false);

  const redlines = docMode === "msa" ? DEMO_MSA_REDLINES : DEMO_NDA_REDLINES;

  function playBestLine() {
    setBestLinePlayed(true);
    setHighlightedNodes(["move_a", "move_a_1"]);
    setEvalScore(0.8);
    setTimelineAnimate(true);
  }

  return (
    <div className="flex flex-col h-full" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 gap-4 flex-wrap border-b border-zinc-200 bg-white">
        {/* Doc mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-zinc-200 overflow-hidden">
            {(["msa", "nda"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setDocMode(m)}
                className="px-4 py-1.5 text-xs font-medium uppercase transition-colors"
                style={{
                  background: docMode === m ? "#18181b" : "transparent",
                  color: docMode === m ? "white" : "#52525b",
                }}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="text-sm font-medium text-zinc-600">
            {docMode === "msa" ? "MSA — Initech Redlines" : "NDA — Initech Redlines"}
          </span>
        </div>

        {/* Calendar chip */}
        <CalendarChip nextHardStop={HARD_STOP} eventTitle="Board readout" />

        {/* Play Best Line */}
        <button
          onClick={playBestLine}
          className="flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm text-white transition-all hover:-translate-y-0.5"
          style={{
            background: bestLinePlayed ? "#059669" : "#18181b",
          }}
        >
          <Zap size={14} />
          {bestLinePlayed ? "Best Line Active" : "Play Best Line"}
        </button>
      </div>

      {/* Main layout: 3 columns */}
      <div className="flex-1 grid gap-0 bg-zinc-50" style={{ gridTemplateColumns: "320px 1fr 340px", overflow: "hidden" }}>
        {/* LEFT: Redline pile + walkaway */}
        <div className="bg-white border-r border-zinc-200 p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 flex justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
              {redlines.length} Redlines
            </p>
            <span className="text-xs font-mono text-zinc-400">
              R01–R{redlines.length}
            </span>
          </div>
          <RedlinePile
            redlines={redlines}
            onSelect={setSelectedRedline}
            selectedId={selectedRedline}
          />
          <WalkawayLine line={DEMO_WALKAWAY} />
        </div>

        {/* CENTER: Game tree + TrueSight */}
        <div className="bg-zinc-50 p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
              Game Tree — Bloom
            </p>
            {bestLinePlayed && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(0,196,140,0.1)", color: "var(--color-success)" }}>
                Best Line !! highlighted
              </span>
            )}
          </div>

          <div className="rounded-[1.25rem] border border-zinc-200 bg-white p-3 shadow-sm">
            <GameTreeBoard
              tree={DEMO_GAME_TREE}
              highlightedNodeIds={highlightedNodes}
              onNodeHover={(id) => {
                const n = DEMO_GAME_TREE.nodes[id];
                if (n?.move) setEvalScore(n.move.closeProbability * 8 - 4);
              }}
            />
          </div>

          <div className="rounded-[1.25rem] border border-zinc-200 bg-white p-3 shadow-sm">
            <TrueSightLayer result={DEMO_COMPLIANCE.trueSight} />
          </div>

          {/* Work product panes */}
          <div className="rounded-[1.25rem] border border-zinc-200 bg-white p-3 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowPdf(!showPdf)}
                className="flex items-center gap-2 p-3 rounded-xl border border-zinc-200 transition-colors hover:bg-zinc-50"
              >
                <FileText size={14} style={{ color: "var(--color-brand)" }} />
                <span className="text-xs font-medium text-zinc-900">
                  DOCX Counter-Redline
                </span>
                <ChevronRight size={12} className="text-zinc-400 ml-auto" />
              </button>
              <button
                className="flex items-center gap-2 p-3 rounded-xl border border-zinc-200 transition-colors hover:bg-zinc-50"
              >
                <FileCheck size={14} style={{ color: "var(--color-brand)" }} />
                <span className="text-xs font-medium text-zinc-900">
                  Supervisor PDF
                </span>
                <ChevronRight size={12} className="text-zinc-400 ml-auto" />
              </button>
            </div>
          </div>

          {showPdf && (
            <div className="rounded-xl border border-zinc-200 p-4 text-xs bg-zinc-50 text-zinc-600">
              <p className="font-semibold mb-1 text-zinc-900">
                MSA Counter-Redline Preview
              </p>
              <p className="italic">DOCX will be generated by Will&apos;s Work Product API (<code>GET /api/workproduct/docx?dealId=deal_initech_msa_001</code>). Pending T8 integration.</p>
            </div>
          )}

          {/* Execution timeline */}
          <div className="rounded-[1.25rem] border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-3">
              Execution Timeline
            </p>
            <ExecutionTimeline events={DEMO_TIMELINE} animate={timelineAnimate} />
          </div>
        </div>

        {/* RIGHT: Eval bar + Ghost + Compliance */}
        <div className="bg-white border-l border-zinc-200 p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="rounded-[1.25rem] border border-zinc-200 bg-zinc-50 p-4 flex justify-center">
            <EvalBar score={evalScore} />
          </div>

          <GhostCard ghost={DEMO_GHOST} />

          <div className="rounded-[1.25rem] border border-zinc-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
                Compliance
              </p>
              <button
                onClick={() => setShowCompliance(!showCompliance)}
                className="text-xs font-medium"
                style={{ color: "var(--color-brand)" }}
              >
                {showCompliance ? "Hide" : "Expand"}
              </button>
            </div>
            <div className="px-3 pb-3">
              {showCompliance ? (
                <CompliancePanel report={DEMO_COMPLIANCE} />
              ) : (
                <button
                  onClick={() => setShowCompliance(true)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border transition-colors hover:bg-zinc-50"
                  style={{ borderColor: "rgba(255,59,48,0.3)", background: "rgba(255,59,48,0.04)" }}
                >
                  <div className="flex gap-1">
                    {["OSFI", "PIPEDA", "Law 25"].map((r) => (
                      <span
                        key={r}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(255,59,48,0.1)", color: "var(--color-error)" }}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: "var(--color-error)" }}>3 triggered</span>
                </button>
              )}
            </div>
          </div>

          <VoiceSignoff onSigned={() => setTimelineAnimate(true)} />
        </div>
      </div>
    </div>
  );
}
