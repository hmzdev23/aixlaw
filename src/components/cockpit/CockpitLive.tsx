"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  DEMO_MSA_REDLINES,
  DEMO_NDA_REDLINES,
} from "@/lib/fixtures/demo";
import { apiGetJson, apiPostJson } from "@/lib/api/client";
import type {
  ComplianceReport,
  GameTree,
  GhostProfile,
  TimelineEvent,
  WalkawayLine as WalkawayLineType,
} from "@/lib/contracts/models";
import { ChevronRight, Zap, FileText, FileCheck } from "lucide-react";

interface CockpitLiveProps {
  dealId: string;
}

export function CockpitLive({ dealId }: CockpitLiveProps) {
  const [docMode, setDocMode] = useState<"msa" | "nda">("msa");
  const [selectedRedline, setSelectedRedline] = useState<string | undefined>();
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [bestLinePlayed, setBestLinePlayed] = useState(false);
  const [showCompliance, setShowCompliance] = useState(true);
  const [showPdf, setShowPdf] = useState(false);
  const [counterPreview, setCounterPreview] = useState<string | null>(null);

  const [ghost, setGhost] = useState<GhostProfile | null>(null);
  const [tree, setTree] = useState<GameTree | null>(null);
  const [walkaway, setWalkaway] = useState<WalkawayLineType | null>(null);
  const [evalScore, setEvalScore] = useState<number>(-2.4);
  const [compliance, setCompliance] = useState<ComplianceReport | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [calendarStop, setCalendarStop] = useState<string | undefined>();
  const [calendarTitle, setCalendarTitle] = useState<string | undefined>();

  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  const redlines = useMemo(
    () => (docMode === "msa" ? DEMO_MSA_REDLINES : DEMO_NDA_REDLINES),
    [docMode],
  );

  const bootstrap = useCallback(async () => {
    setBusy(true);
    setLoadError(null);
    try {
      await apiPostJson<{ event: { calendarContext?: { nextHardStop: string; eventTitle: string } } }>(
        "/api/demo/trigger",
        { dealId, documentFocus: "msa" },
      );

      const latest = await apiGetJson<{
        event: { calendarContext?: { nextHardStop: string; eventTitle: string } };
      }>(`/api/inbound/latest?dealId=${encodeURIComponent(dealId)}`);
      if (latest.event.calendarContext) {
        setCalendarStop(latest.event.calendarContext.nextHardStop);
        setCalendarTitle(latest.event.calendarContext.eventTitle);
      }

      const [g, tr, wa, fixture] = await Promise.all([
        apiPostJson<GhostProfile>("/api/engine/ghost", { dealId }),
        apiPostJson<GameTree>("/api/engine/tree", { dealId }),
        apiGetJson<WalkawayLineType>(
          `/api/engine/walkaway?dealId=${encodeURIComponent(dealId)}`,
        ),
        apiGetJson<{ text: string }>("/api/fixtures/msa"),
      ]);

      setGhost(g);
      setTree(tr);
      setWalkaway(wa);
      setEvalScore(tr.evalScore);

      const report = await apiPostJson<ComplianceReport>("/api/engine/compliance", {
        text: fixture.text.slice(0, 120_000),
        locale: "en",
        dealId,
      });
      setCompliance(report);
    } catch (e) {
      setLoadError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [dealId]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const es = new EventSource(
      `/api/execution/stream?dealId=${encodeURIComponent(dealId)}`,
    );
    const next: TimelineEvent[] = [];
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as TimelineEvent;
        next.push(data);
        setTimeline([...next]);
      } catch {
        /* ignore */
      }
    };
    es.onerror = () => {
      es.close();
    };
    return () => es.close();
  }, [dealId]);

  async function playBestLine() {
    if (!tree) return;
    const moveId = tree.primaryBranchIds[0];
    setHighlightedNodes([moveId]);
    try {
      const decision = await apiPostJson<Record<string, unknown>>(
        "/api/playbooks/pb_default/execute",
        { dealId },
      );
      await apiPostJson("/api/workproduct/decision", decision);
      setBestLinePlayed(true);
      const score = await apiPostJson<{ score: number }>("/api/engine/eval", {
        dealId,
        nodeId: moveId,
      });
      setEvalScore(score.score);
      await apiPostJson("/api/execution/fire", { dealId });
    } catch (e) {
      setLoadError((e as Error).message);
    }
  }

  async function handleNodeHover(nodeId: string) {
    if (!tree) return;
    const n = tree.nodes[nodeId];
    if (n?.move) {
      setEvalScore(n.move.closeProbability * 8 - 4);
    }
    try {
      const res = await fetch(
        `/api/engine/counter?id=${encodeURIComponent(dealId)}&nodeId=${encodeURIComponent(nodeId)}`,
      );
      const j = (await res.json()) as { ok: boolean; data?: { text: string } };
      if (j.ok && j.data?.text) setCounterPreview(j.data.text);
    } catch {
      setCounterPreview(null);
    }
  }

  if (busy && !ghost) {
    return (
      <div className="flex flex-1 items-center justify-center p-16 text-sm text-[#777169]">
        Loading cockpit…
      </div>
    );
  }

  if (loadError && !ghost) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10">
        <p className="text-sm text-red-600">{loadError}</p>
        <button
          type="button"
          className="rounded-full bg-[#0c0a09] px-4 py-2 text-sm text-white"
          onClick={() => void bootstrap()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ minHeight: "calc(100vh - 120px)" }}>
      <div className="flex items-center justify-between px-2 py-3 gap-4 flex-wrap border-b border-[#e7e5e4] bg-[#f5f5f5]">
        <div className="flex items-center gap-2">
          <div className="flex border border-[#e7e5e4] rounded-full overflow-hidden">
            {(["msa", "nda"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDocMode(m)}
                className={`px-4 py-1.5 text-xs font-medium uppercase transition-colors ${
                  docMode === m ? "bg-[#0c0a09] text-white" : "bg-transparent text-[#777169]"
                }`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="text-[15px] font-medium text-[#4e4e4e]">
            {docMode === "msa" ? "MSA — Initech Redlines" : "NDA — Initech Redlines"}
          </span>
        </div>

        {calendarStop ? (
          <CalendarChip nextHardStop={calendarStop} eventTitle={calendarTitle ?? "Next hard stop"} />
        ) : (
          <CalendarChip
            nextHardStop={new Date(Date.now() + 3_600_000).toISOString()}
            eventTitle="Board readout (demo)"
          />
        )}

        <button
          type="button"
          onClick={() => void playBestLine()}
          disabled={!tree || busy}
          className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium text-[15px] text-white transition-colors ${
            bestLinePlayed ? "bg-[#16a34a]" : "bg-[#0c0a09]"
          }`}
        >
          <Zap size={14} />
          {bestLinePlayed ? "Best Line Active" : "Play Best Line"}
        </button>
      </div>

      <div
        className="flex-1 grid gap-0 bg-[#f5f5f5]"
        style={{ gridTemplateColumns: "320px 1fr 340px", overflow: "hidden" }}
      >
        <div className="bg-white border-r border-[#e7e5e4] p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-[#f0efed] rounded-xl px-3 py-2 flex justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#777169]">
              {redlines.length} Redlines
            </p>
            <span className="text-xs font-mono text-[#777169]">R01–R{redlines.length}</span>
          </div>
          <RedlinePile
            redlines={redlines}
            onSelect={setSelectedRedline}
            selectedId={selectedRedline}
          />
          {walkaway ? <WalkawayLine line={walkaway} /> : null}
        </div>

        <div className="bg-[#f5f5f5] p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#777169]">
              Game Tree — Bloom
            </p>
            {bestLinePlayed && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "rgba(0,196,140,0.1)", color: "var(--color-success)" }}
              >
                Best line highlighted
              </span>
            )}
          </div>

          <div className="bg-white border border-[#e7e5e4] rounded-xl p-4">
            {tree ? (
              <GameTreeBoard
                tree={tree}
                highlightedNodeIds={highlightedNodes}
                onNodeHover={(id) => void handleNodeHover(id)}
              />
            ) : (
              <p className="text-xs text-[#777169]">Tree unavailable</p>
            )}
            {counterPreview ? (
              <p className="mt-2 text-xs text-[#4e4e4e] border-t border-[#e7e5e4] pt-2">
                <span className="font-semibold text-[#0c0a09]">Counter preview: </span>
                {counterPreview}
              </p>
            ) : null}
          </div>

          <div className="bg-white border border-[#e7e5e4] rounded-xl p-4">
            {compliance ? (
              <TrueSightLayer result={compliance.trueSight} />
            ) : (
              <p className="text-xs text-[#777169]">TrueSight loading…</p>
            )}
          </div>

          <div className="bg-white border border-[#e7e5e4] rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`/api/workproduct/docx?dealId=${encodeURIComponent(dealId)}`}
                className="flex items-center gap-2 p-3 rounded-xl border border-zinc-200 transition-colors hover:bg-zinc-50"
              >
                <FileText size={14} style={{ color: "var(--color-brand)" }} />
                <span className="text-xs font-medium text-zinc-900">DOCX Counter-Redline</span>
                <ChevronRight size={12} className="text-zinc-400 ml-auto" />
              </a>
              <a
                href={`/api/workproduct/supervisor?dealId=${encodeURIComponent(dealId)}&mode=legal`}
                className="flex items-center gap-2 p-3 rounded-xl border border-zinc-200 transition-colors hover:bg-zinc-50"
              >
                <FileCheck size={14} style={{ color: "var(--color-brand)" }} />
                <span className="text-xs font-medium text-zinc-900">Supervisor PDF</span>
                <ChevronRight size={12} className="text-zinc-400 ml-auto" />
              </a>
            </div>
          </div>

          {showPdf ? (
            <div className="bg-white border border-[#e7e5e4] rounded-xl p-4 text-xs text-[#4e4e4e]">
              <p className="font-semibold mb-1 text-zinc-900">Artifacts</p>
              <p>Use the links above after &quot;Play Best Line&quot; stores a Decision.</p>
            </div>
          ) : null}

          <div className="bg-white border border-[#e7e5e4] rounded-xl p-4">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#777169] mb-3">
              Execution Timeline
            </p>
            <ExecutionTimeline events={timeline.length ? timeline : []} animate={timeline.length > 0} />
          </div>
        </div>

        <div className="bg-white border-l border-[#e7e5e4] p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-[#f5f5f5] border border-[#e7e5e4] rounded-xl p-4 flex justify-center">
            <EvalBar score={evalScore} />
          </div>

          {ghost ? <GhostCard ghost={ghost} /> : null}

          <div className="bg-white border border-[#e7e5e4] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
              <p className="text-[12px] font-semibold uppercase tracking-widest text-[#777169]">
                Compliance
              </p>
              <button
                type="button"
                onClick={() => setShowCompliance(!showCompliance)}
                className="text-xs font-medium"
                style={{ color: "var(--color-brand)" }}
              >
                {showCompliance ? "Hide" : "Expand"}
              </button>
            </div>
            <div className="px-3 pb-3">
              {showCompliance && compliance ? (
                <CompliancePanel report={compliance} />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCompliance(true)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border transition-colors hover:bg-zinc-50"
                  style={{ borderColor: "rgba(255,59,48,0.3)", background: "rgba(255,59,48,0.04)" }}
                >
                  <span className="text-xs font-semibold" style={{ color: "var(--color-error)" }}>
                    {compliance?.osfi.triggered || compliance?.pipeda.triggered
                      ? "Regimes triggered — expand"
                      : "Run compliance scan"}
                  </span>
                </button>
              )}
            </div>
          </div>

          <VoiceSignoff
            onSigned={() => {
              setShowPdf(true);
            }}
          />
        </div>
      </div>
    </div>
  );
}
