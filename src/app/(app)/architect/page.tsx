"use client";

import { useState } from "react";
import { ArchitectCanvas } from "@/components/architect/ArchitectCanvas";
import { DEMO_PLAYBOOK } from "@/lib/fixtures/demo";
import type { Playbook, AgentBlock, AgentBlockType } from "@/lib/contracts/models";
import { Save, Download, Network, X, Sliders } from "lucide-react";

const PALETTE_BLOCKS: { type: AgentBlockType; label: string }[] = [
  { type: "spellbook_issue_detector", label: "Spellbook" },
  { type: "ghost", label: "Ghost" },
  { type: "osfi_vendor_management", label: "OSFI Vendor Mgmt" },
  { type: "pipeda_watcher", label: "PIPEDA Watcher" },
  { type: "law25", label: "Law 25" },
  { type: "crown", label: "Crown" },
  { type: "truesight", label: "TrueSight" },
  { type: "supervisor_pdf", label: "Supervisor PDF" },
  { type: "slack_notifier", label: "Slack Notifier" },
  { type: "gmail_drafter", label: "Gmail Draft" },
  { type: "stripe_webhook", label: "Stripe (CAD)" },
  { type: "notary_router", label: "Notary Queue" },
];

const NUMERIC_PARAMS: Record<string, { min: number; max: number; step: number; label: string }> = {
  sensitivity: { min: 0, max: 1, step: 0.1, label: "Sensitivity" },
  elo_threshold: { min: 1000, max: 3000, step: 100, label: "ELO Threshold" },
  strictness: { min: 0, max: 1, step: 0.1, label: "Strictness" },
  consensus_threshold: { min: 0.5, max: 1, step: 0.05, label: "Consensus Threshold" },
};

function getPaletteBlockClass(type: AgentBlockType): string {
  if (type === "osfi_vendor_management" || type === "pipeda_watcher" || type === "law25") {
    return "rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-700 cursor-grab hover:bg-emerald-100 transition-colors";
  }
  if (type === "truesight" || type === "crown") {
    return "rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-xs font-medium text-violet-700 cursor-grab hover:bg-violet-100 transition-colors";
  }
  if (type === "slack_notifier" || type === "gmail_drafter") {
    return "rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs font-medium text-sky-700 cursor-grab hover:bg-sky-100 transition-colors";
  }
  if (type === "stripe_webhook" || type === "notary_router") {
    return "rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-700 cursor-grab hover:bg-amber-100 transition-colors";
  }
  // spellbook, ghost, supervisor_pdf → default zinc
  return "rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs font-medium text-zinc-700 cursor-grab hover:bg-zinc-100 transition-colors";
}

export default function ArchitectPage() {
  const [playbook, setPlaybook] = useState<Playbook>(DEMO_PLAYBOOK);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedName, setSavedName] = useState(playbook.name);
  const [savedVersion, setSavedVersion] = useState(playbook.version);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedBlock = selectedNodeId
    ? playbook.blocks.find((b) => b.id === selectedNodeId)
    : null;

  function handleSave() {
    setPlaybook((p) => ({
      ...p,
      name: savedName,
      version: savedVersion,
      updatedAt: new Date().toISOString(),
    }));
    setShowSaveModal(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  function handleExport() {
    const json = JSON.stringify(playbook, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${playbook.name.replace(/\s+/g, "_")}_${playbook.version}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function updateParam(blockId: string, key: string, value: number | string | boolean) {
    setPlaybook((p) => ({
      ...p,
      blocks: p.blocks.map((b) =>
        b.id === blockId ? { ...b, params: { ...b.params, [key]: value } } : b
      ),
    }));
  }

  return (
    <div className="flex h-full bg-zinc-50" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Left: Block palette */}
      <div className="w-52 bg-white border-r border-zinc-200 p-4 flex flex-col gap-2 overflow-y-auto">
        <div className="flex items-center gap-2 mb-1">
          <Network size={14} style={{ color: "var(--color-brand)" }} />
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            Block Palette
          </p>
        </div>
        <p className="text-xs text-zinc-400 mb-1">
          Drag to canvas
        </p>
        {PALETTE_BLOCKS.map(({ type, label }) => (
          <div
            key={type}
            className={getPaletteBlockClass(type)}
            draggable
          >
            {label}
          </div>
        ))}
      </div>

      {/* Center: Canvas */}
      <div className="flex-1 relative">
        {/* Canvas toolbar */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          {saveSuccess && (
            <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-1 font-medium">
              Saved!
            </span>
          )}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white text-xs font-medium text-zinc-600 px-3 py-1.5 shadow-sm hover:bg-zinc-50 transition-colors"
          >
            <Download size={12} />
            Export JSON
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1.5 rounded-full bg-zinc-950 text-white px-4 py-1.5 text-xs font-semibold"
          >
            <Save size={12} />
            Save Playbook
          </button>
        </div>

        <ArchitectCanvas
          playbook={playbook}
          onChange={setPlaybook}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
        />
      </div>

      {/* Right: Inspector */}
      <div className="w-64 bg-white border-l border-zinc-200 p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center gap-2">
          <Sliders size={14} style={{ color: "var(--color-brand)" }} />
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            Inspector
          </p>
        </div>

        {selectedBlock ? (
          <>
            <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
              <p className="text-xs font-semibold capitalize text-zinc-900">
                {selectedBlock.type.replace(/_/g, " ")}
              </p>
              <p className="text-xs font-mono mt-0.5 text-zinc-400">
                {selectedBlock.id}
              </p>
            </div>

            {Object.entries(selectedBlock.params).map(([key, val]) => {
              const meta = NUMERIC_PARAMS[key];
              if (meta && typeof val === "number") {
                return (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-medium text-zinc-600">
                        {meta.label}
                      </label>
                      <span className="text-xs font-mono text-zinc-900">
                        {val}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={meta.min}
                      max={meta.max}
                      step={meta.step}
                      value={val}
                      onChange={(e) => updateParam(selectedBlock.id, key, parseFloat(e.target.value))}
                      className="w-full accent-[#FF4B00]"
                      aria-label={`${meta.label} slider`}
                    />
                  </div>
                );
              }
              return (
                <div key={key}>
                  <label className="text-xs font-medium mb-1 block text-zinc-600">
                    {key}
                  </label>
                  <input
                    type="text"
                    value={String(val)}
                    onChange={(e) => updateParam(selectedBlock.id, key, e.target.value)}
                    className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs text-zinc-900 w-full"
                  />
                </div>
              );
            })}
          </>
        ) : (
          <>
            <p className="text-xs text-zinc-400">
              Click a node to inspect and tune its parameters.
            </p>
            <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
              <p className="text-xs font-semibold mb-1 text-zinc-900">
                {playbook.name}
              </p>
              <p className="text-xs text-zinc-400">v{playbook.version}</p>
              <p className="text-xs mt-1 text-zinc-400">
                {playbook.blocks.length} blocks · {playbook.edges.length} edges
              </p>
            </div>
          </>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 w-80 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-zinc-900">Save Playbook</h2>
              <button onClick={() => setShowSaveModal(false)} aria-label="Close">
                <X size={16} className="text-zinc-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block text-zinc-600">Name</label>
                <input
                  type="text"
                  value={savedName}
                  onChange={(e) => setSavedName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block text-zinc-600">Version</label>
                <input
                  type="text"
                  value={savedVersion}
                  onChange={(e) => setSavedVersion(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-200"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-2 rounded-full text-sm font-medium border border-zinc-200 text-zinc-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 rounded-full text-sm font-semibold bg-zinc-950 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
