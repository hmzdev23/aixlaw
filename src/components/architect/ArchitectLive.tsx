"use client";

import { useMemo, useState } from "react";
import { Download, Library, Play, Save, SlidersHorizontal } from "lucide-react";
import { ArchitectCanvas } from "@/components/architect/ArchitectCanvas";
import { apiPostJson } from "@/lib/api/client";
import { usePlaybookApi, usePlaybookList } from "@/hooks/usePlaybookApi";
import type { AgentBlock, Decision, Playbook } from "@/lib/contracts/models";

function clonePlaybook(pb: Playbook, name: string): Playbook {
  return {
    ...pb,
    id: `pb_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}_${Date.now()}`,
    name,
    version: "1.0.0",
    createdBy: "sarah",
    updatedAt: new Date().toISOString(),
  };
}

export function ArchitectLive({ dealId }: { dealId: string }) {
  const library = usePlaybookList();
  const api = usePlaybookApi("pb_default");
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [saveName, setSaveName] = useState("Stikeman Tech M&A Playbook v1.0");
  const [status, setStatus] = useState<string>("Load the default playbook, tune a block, then save or execute.");
  const [decision, setDecision] = useState<Decision | null>(null);

  if (!playbook && api.data) setPlaybook(api.data);

  const selectedNode = useMemo<AgentBlock | null>(
    () => playbook?.blocks.find((b) => b.id === selectedNodeId) ?? null,
    [playbook, selectedNodeId],
  );

  async function load(id: string) {
    setStatus(`Loading ${id}…`);
    const next = await api.load(id);
    setPlaybook(next);
    setSelectedNodeId(null);
    setStatus(`Loaded ${next.name}.`);
  }

  async function save() {
    if (!playbook) return;
    const toSave = playbook.id === "pb_default" ? clonePlaybook(playbook, saveName) : { ...playbook, name: saveName };
    setStatus("Saving playbook…");
    const stored = await api.save(toSave);
    setPlaybook(stored);
    await library.mutate();
    setStatus(`Saved ${stored.name}.`);
  }

  async function execute() {
    if (!playbook) return;
    setStatus("Executing playbook through ArchitectRuntime…");
    const out = await api.execute(playbook.id, dealId);
    setDecision(out);
    await apiPostJson("/api/workproduct/decision", out);
    setStatus(`Decision ${out.chosenMoveId} generated and handed to work product.`);
  }

  function updateParam(key: string, value: number) {
    if (!playbook || !selectedNode) return;
    setPlaybook({
      ...playbook,
      blocks: playbook.blocks.map((block) =>
        block.id === selectedNode.id
          ? { ...block, params: { ...block.params, [key]: value } }
          : block,
      ),
      updatedAt: new Date().toISOString(),
    });
  }

  if (api.error) {
    return (
      <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Failed to load playbook: {(api.error as Error).message}
      </div>
    );
  }

  if (!playbook) {
    return (
      <div className="grid h-[620px] place-items-center rounded-[24px] border border-[var(--hairline)] bg-[var(--canvas-soft)] text-sm text-[var(--muted)]">
        Loading playbook canvas…
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
      <aside className="rounded-[24px] border border-[var(--hairline)] bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <Library className="h-4 w-4" />
          <p className="text-sm font-semibold">Library</p>
        </div>
        <div className="space-y-2">
          {(library.data ?? []).map((pb) => (
            <button
              key={pb.id}
              type="button"
              onClick={() => void load(pb.id)}
              className={`w-full rounded-2xl border px-3 py-3 text-left text-sm ${
                pb.id === playbook.id
                  ? "border-[#0c0a09] bg-[#0c0a09] text-white"
                  : "border-[var(--hairline)] bg-[var(--canvas-soft)] text-[var(--ink)]"
              }`}
            >
              <span className="block font-medium">{pb.name}</span>
              <span className="mt-1 block text-xs opacity-65">v{pb.version}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 border-t border-[var(--hairline)] pt-5">
          <p className="caption-upper">Save as</p>
          <input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--hairline)] px-3 py-2 text-sm outline-none focus:border-[#0c0a09]"
          />
          <button
            type="button"
            onClick={() => void save()}
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#0c0a09] text-sm font-medium text-white"
          >
            <Save className="h-4 w-4" />
            Save Playbook
          </button>
          <a
            href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(playbook, null, 2))}`}
            download={`${playbook.id}.json`}
            className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--hairline)] text-sm font-medium"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </a>
        </div>
      </aside>

      <section className="overflow-hidden rounded-[24px] border border-[var(--hairline)] bg-white">
        <div className="flex items-center justify-between border-b border-[var(--hairline)] px-5 py-4">
          <div>
            <p className="caption-upper">Live DAG</p>
            <h2 className="text-lg font-semibold text-[var(--ink)]">{playbook.name}</h2>
          </div>
          <button
            type="button"
            onClick={() => void execute()}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0c0a09] px-4 text-sm font-medium text-white"
          >
            <Play className="h-4 w-4" />
            Execute
          </button>
        </div>
        <div className="h-[610px]">
          <ArchitectCanvas
            playbook={playbook}
            onChange={setPlaybook}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        </div>
      </section>

      <aside className="rounded-[24px] border border-[var(--hairline)] bg-[var(--canvas-soft)] p-4">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <p className="text-sm font-semibold">Inspector</p>
        </div>
        {selectedNode ? (
          <div>
            <p className="caption-upper">{selectedNode.type.replaceAll("_", " ")}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">{selectedNode.id}</p>
            <div className="mt-5 space-y-4">
              {["riskTolerance", "urgency", "riskAversion", "weight", "closeProbabilityTarget"].map((key) => {
                const raw = selectedNode.params[key];
                const value = typeof raw === "number" ? raw : 0.5;
                return (
                  <label key={key} className="block">
                    <span className="mb-2 flex justify-between text-xs text-[var(--body)]">
                      <span>{key}</span>
                      <span>{value.toFixed(2)}</span>
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={value}
                      onChange={(e) => updateParam(key, Number(e.target.value))}
                      className="w-full accent-[#0c0a09]"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm leading-6 text-[var(--muted)]">Select a block to tune its execution weights.</p>
        )}

        <div className="mt-6 rounded-2xl bg-white p-4">
          <p className="caption-upper">Runtime status</p>
          <p className="mt-2 text-sm leading-6 text-[var(--body)]">{status}</p>
          {decision ? (
            <div className="mt-4 rounded-2xl bg-[var(--surface-strong)] p-3 text-xs text-[var(--body)]">
              <p className="font-semibold text-[var(--ink)]">{decision.chosenMoveId}</p>
              <p className="mt-1">{decision.summaryPlain}</p>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
