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
    <div className="flex h-full bg-[#f5f5f5]" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Left: Block palette */}
      <div className="w-52 bg-white border-r border-[#e7e5e4] p-4 flex flex-col gap-2 overflow-y-auto">
        <div className="flex items-center gap-2 mb-1">
          <Network size={14} className="text-[#777169]" />
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[#777169]">
            Block Palette
          </p>
        </div>
        <p className="text-xs text-[#777169] mb-1">
          Drag to canvas
        </p>
        {PALETTE_BLOCKS.map(({ type, label }) => (
          <div
            key={type}
            className="bg-[#f5f5f5] border border-[#e7e5e4] rounded-lg px-3 py-2.5 text-[13px] font-medium text-[#292524] cursor-grab hover:bg-[#f0efed] transition-colors"
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
            <span className="bg-[#f0efed] text-[#16a34a] border border-[#e7e5e4] rounded-full px-3 py-1 text-[12px] font-medium">
              Saved!
            </span>
          )}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 border border-[#e7e5e4] bg-white text-[#292524] rounded-full px-4 py-1.5 text-[13px] font-medium hover:bg-[#f5f5f5] transition-colors"
          >
            <Download size={12} />
            Export JSON
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1.5 bg-[#0c0a09] text-white rounded-full px-4 py-1.5 text-[13px] font-medium"
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
      <div className="w-64 bg-white border-l border-[#e7e5e4] p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center gap-2">
          <Sliders size={14} className="text-[#777169]" />
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[#777169]">
            Inspector
          </p>
        </div>

        {selectedBlock ? (
          <>
            <div className="bg-[#f5f5f5] border border-[#e7e5e4] rounded-xl p-3">
              <p className="text-[13px] font-medium capitalize text-[#4e4e4e]">
                {selectedBlock.type.replace(/_/g, " ")}
              </p>
              <p className="text-xs font-mono mt-0.5 text-[#777169]">
                {selectedBlock.id}
              </p>
            </div>

            {Object.entries(selectedBlock.params).map(([key, val]) => {
              const meta = NUMERIC_PARAMS[key];
              if (meta && typeof val === "number") {
                return (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <label className="text-[13px] font-medium text-[#4e4e4e]">
                        {meta.label}
                      </label>
                      <span className="text-xs font-mono text-[#0c0a09]">
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
                      className="w-full accent-[#0c0a09]"
                      aria-label={`${meta.label} slider`}
                    />
                  </div>
                );
              }
              return (
                <div key={key}>
                  <label className="text-[13px] font-medium mb-1 block text-[#4e4e4e]">
                    {key}
                  </label>
                  <input
                    type="text"
                    value={String(val)}
                    onChange={(e) => updateParam(selectedBlock.id, key, e.target.value)}
                    className="border border-[#e7e5e4] rounded-lg px-3 py-2 text-[13px] text-[#0c0a09] w-full bg-white"
                  />
                </div>
              );
            })}
          </>
        ) : (
          <>
            <p className="text-xs text-[#777169]">
              Click a node to inspect and tune its parameters.
            </p>
            <div className="bg-[#f5f5f5] border border-[#e7e5e4] rounded-xl p-3">
              <p className="text-[13px] font-medium mb-1 text-[#0c0a09]">
                {playbook.name}
              </p>
              <p className="text-xs text-[#777169]">v{playbook.version}</p>
              <p className="text-xs mt-1 text-[#777169]">
                {playbook.blocks.length} blocks · {playbook.edges.length} edges
              </p>
            </div>
          </>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="bg-white border border-[#e7e5e4] rounded-2xl p-6 w-80 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#0c0a09]">Save Playbook</h2>
              <button onClick={() => setShowSaveModal(false)} aria-label="Close">
                <X size={16} className="text-[#777169]" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block text-[#4e4e4e]">Name</label>
                <input
                  type="text"
                  value={savedName}
                  onChange={(e) => setSavedName(e.target.value)}
                  className="border border-[#e7e5e4] rounded-lg px-3 py-2 text-[13px] text-[#0c0a09] w-full bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block text-[#4e4e4e]">Version</label>
                <input
                  type="text"
                  value={savedVersion}
                  onChange={(e) => setSavedVersion(e.target.value)}
                  className="border border-[#e7e5e4] rounded-lg px-3 py-2 text-[13px] text-[#0c0a09] w-full bg-white"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowSaveModal(false)}
                className="border border-[#e7e5e4] text-[#4e4e4e] rounded-full py-2.5 text-[15px] font-medium flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-[#0c0a09] text-white rounded-full py-2.5 text-[15px] font-medium flex-1"
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
