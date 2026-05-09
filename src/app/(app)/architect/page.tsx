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
    <div className="flex h-full" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Left: Block palette */}
      <div
        className="w-52 flex flex-col overflow-y-auto p-3 gap-2"
        style={{ borderRight: "1px solid var(--color-gray-200)", background: "white" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Network size={14} style={{ color: "var(--color-brand)" }} />
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-gray-400)" }}>
            Block Palette
          </p>
        </div>
        <p className="text-xs" style={{ color: "var(--color-gray-400)" }}>
          Drag blocks to canvas (T5 integration pending)
        </p>
        {PALETTE_BLOCKS.map(({ type, label }) => (
          <div
            key={type}
            className="p-2 rounded-lg border text-xs font-medium cursor-grab active:cursor-grabbing"
            style={{ borderColor: "var(--color-gray-200)", color: "var(--color-gray-600)", background: "var(--color-gray-50)" }}
            draggable
          >
            {label}
          </div>
        ))}
      </div>

      {/* Center: Canvas */}
      <div className="flex-1 relative">
        {/* Canvas toolbar */}
        <div
          className="absolute top-3 right-3 flex items-center gap-2 z-10"
        >
          {saveSuccess && (
            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "rgba(0,196,140,0.1)", color: "var(--color-success)" }}>
              Saved!
            </span>
          )}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors hover:bg-gray-50"
            style={{ borderColor: "var(--color-gray-200)", color: "var(--color-gray-600)" }}
          >
            <Download size={12} />
            Export JSON
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #FF4B00, #FF7A40)",
              boxShadow: "0 2px 8px rgba(255,75,0,0.3)",
            }}
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
      <div
        className="w-64 flex flex-col overflow-y-auto p-4 gap-3"
        style={{ borderLeft: "1px solid var(--color-gray-200)", background: "white" }}
      >
        <div className="flex items-center gap-2">
          <Sliders size={14} style={{ color: "var(--color-brand)" }} />
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-gray-400)" }}>
            Inspector
          </p>
        </div>

        {selectedBlock ? (
          <>
            <div className="p-3 rounded-xl" style={{ background: "var(--color-gray-50)", border: "1px solid var(--color-gray-200)" }}>
              <p className="text-xs font-semibold capitalize" style={{ color: "var(--color-gray-900)" }}>
                {selectedBlock.type.replace(/_/g, " ")}
              </p>
              <p className="text-xs font-mono mt-0.5" style={{ color: "var(--color-gray-400)" }}>
                {selectedBlock.id}
              </p>
            </div>

            {Object.entries(selectedBlock.params).map(([key, val]) => {
              const meta = NUMERIC_PARAMS[key];
              if (meta && typeof val === "number") {
                return (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-medium" style={{ color: "var(--color-gray-600)" }}>
                        {meta.label}
                      </label>
                      <span className="text-xs font-mono" style={{ color: "var(--color-gray-900)" }}>
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
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-gray-600)" }}>
                    {key}
                  </label>
                  <input
                    type="text"
                    value={String(val)}
                    onChange={(e) => updateParam(selectedBlock.id, key, e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-lg border"
                    style={{ borderColor: "var(--color-gray-200)", color: "var(--color-gray-900)" }}
                  />
                </div>
              );
            })}
          </>
        ) : (
          <>
            <p className="text-xs" style={{ color: "var(--color-gray-400)" }}>
              Click a node to inspect and tune its parameters.
            </p>
            <div className="p-3 rounded-xl" style={{ background: "var(--color-gray-50)", border: "1px solid var(--color-gray-200)" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-gray-900)" }}>
                {playbook.name}
              </p>
              <p className="text-xs" style={{ color: "var(--color-gray-400)" }}>v{playbook.version}</p>
              <p className="text-xs mt-1" style={{ color: "var(--color-gray-400)" }}>
                {playbook.blocks.length} blocks · {playbook.edges.length} edges
              </p>
            </div>
          </>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="rounded-2xl border p-6 w-80 shadow-2xl" style={{ background: "white", borderColor: "var(--color-gray-200)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold" style={{ color: "var(--color-gray-900)" }}>Save Playbook</h2>
              <button onClick={() => setShowSaveModal(false)} aria-label="Close">
                <X size={16} style={{ color: "var(--color-gray-400)" }} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-gray-600)" }}>Name</label>
                <input
                  type="text"
                  value={savedName}
                  onChange={(e) => setSavedName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border"
                  style={{ borderColor: "var(--color-gray-200)" }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-gray-600)" }}>Version</label>
                <input
                  type="text"
                  value={savedVersion}
                  onChange={(e) => setSavedVersion(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border"
                  style={{ borderColor: "var(--color-gray-200)" }}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-2 rounded-full text-sm font-medium border"
                style={{ borderColor: "var(--color-gray-200)", color: "var(--color-gray-600)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 rounded-full text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #FF4B00, #FF7A40)" }}
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
