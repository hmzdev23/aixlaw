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
      <div
        className="flex items-center justify-between px-6 py-3 gap-4 flex-wrap"
        style={{ borderBottom: "1px solid var(--color-gray-200)", background: "white" }}
      >
        {/* Doc mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border overflow-hidden" style={{ borderColor: "var(--color-gray-200)" }}>
            {(["msa", "nda"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setDocMode(m)}
                className="px-4 py-1.5 text-xs font-semibold uppercase transition-colors"
                style={{
                  background: docMode === m ? "var(--color-gray-900)" : "transparent",
                  color: docMode === m ? "white" : "var(--color-gray-600)",
                }}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="text-sm font-medium" style={{ color: "var(--color-gray-600)" }}>
            {docMode === "msa" ? "MSA — Initech Redlines" : "NDA — Initech Redlines"}
          </span>
        </div>

        {/* Calendar chip */}
        <CalendarChip nextHardStop={HARD_STOP} eventTitle="Board readout" />

        {/* Play Best Line */}
        <button
          onClick={playBestLine}
          className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-sm text-white transition-all hover:-translate-y-0.5"
          style={{
            background: bestLinePlayed
              ? "linear-gradient(135deg, var(--color-success), #00E0A0)"
              : "linear-gradient(135deg, #FF4B00, #FF7A40)",
            boxShadow: "0 4px 16px rgba(255,75,0,0.3)",
          }}
        >
          <Zap size={14} />
          {bestLinePlayed ? "Best Line Active" : "Play Best Line"}
        </button>
      </div>

      {/* Main layout: 3 columns */}
      <div className="flex-1 grid gap-0" style={{ gridTemplateColumns: "320px 1fr 340px", overflow: "hidden" }}>
        {/* LEFT: Redline pile + walkaway */}
        <div
          className="flex flex-col overflow-y-auto p-4 gap-4"
          style={{ borderRight: "1px solid var(--color-gray-200)", background: "white" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-gray-400)" }}>
              {redlines.length} Redlines
            </p>
            <span className="text-xs font-mono" style={{ color: "var(--color-gray-400)" }}>
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
        <div className="flex flex-col overflow-y-auto p-4 gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-gray-400)" }}>
              Game Tree — Bloom
            </p>
            {bestLinePlayed && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "rgba(0,196,140,0.1)", color: "var(--color-success)" }}
              >
                Best Line !! highlighted
              </span>
            )}
          </div>

          <GameTreeBoard
            tree={DEMO_GAME_TREE}
            highlightedNodeIds={highlightedNodes}
            onNodeHover={(id) => {
              const n = DEMO_GAME_TREE.nodes[id];
              if (n?.move) setEvalScore(n.move.closeProbability * 8 - 4);
            }}
          />

          <TrueSightLayer result={DEMO_COMPLIANCE.trueSight} />

          {/* Work product panes */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowPdf(!showPdf)}
              className="flex items-center gap-2 p-3 rounded-xl border transition-colors hover:bg-gray-50"
              style={{ borderColor: "var(--color-gray-200)" }}
            >
              <FileText size={14} style={{ color: "var(--color-brand)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--color-gray-900)" }}>
                DOCX Counter-Redline
              </span>
              <ChevronRight size={12} style={{ color: "var(--color-gray-400)", marginLeft: "auto" }} />
            </button>
            <button
              className="flex items-center gap-2 p-3 rounded-xl border transition-colors hover:bg-gray-50"
              style={{ borderColor: "var(--color-gray-200)" }}
            >
              <FileCheck size={14} style={{ color: "var(--color-brand)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--color-gray-900)" }}>
                Supervisor PDF
              </span>
              <ChevronRight size={12} style={{ color: "var(--color-gray-400)", marginLeft: "auto" }} />
            </button>
          </div>

          {showPdf && (
            <div
              className="rounded-xl border p-4 text-xs"
              style={{ borderColor: "var(--color-gray-200)", background: "var(--color-gray-50)", color: "var(--color-gray-600)" }}
            >
              <p className="font-semibold mb-1" style={{ color: "var(--color-gray-900)" }}>
                MSA Counter-Redline Preview
              </p>
              <p className="italic">DOCX will be generated by Will&apos;s Work Product API (<code>GET /api/workproduct/docx?dealId=deal_initech_msa_001</code>). Pending T8 integration.</p>
            </div>
          )}

          {/* Execution timeline */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-gray-400)" }}>
              Execution Timeline
            </p>
            <ExecutionTimeline events={DEMO_TIMELINE} animate={timelineAnimate} />
          </div>
        </div>

        {/* RIGHT: Eval bar + Ghost + Compliance */}
        <div
          className="flex flex-col overflow-y-auto p-4 gap-4"
          style={{ borderLeft: "1px solid var(--color-gray-200)", background: "white" }}
        >
          <div className="flex items-center justify-center">
            <EvalBar score={evalScore} />
          </div>

          <GhostCard ghost={DEMO_GHOST} />

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-gray-400)" }}>
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
            {showCompliance ? (
              <CompliancePanel report={DEMO_COMPLIANCE} />
            ) : (
              <button
                onClick={() => setShowCompliance(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl border transition-colors hover:bg-gray-50"
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

          <VoiceSignoff onSigned={() => setTimelineAnimate(true)} />
        </div>
      </div>
    </div>
  );
}
