"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AGENTS } from "@/lib/agents";
import { useWizard } from "@/components/wizard/state";

const NODE_WIDTH = 180;

function AgentNode({ data }: NodeProps) {
  const d = data as { name: string; role: string; speciality: string; emoji: string; active: boolean };
  return (
    <div
      className="rounded-xl border bg-white px-3 py-2 shadow-sm"
      style={{
        borderColor: d.active ? "var(--ink)" : "var(--line-strong)",
        width: NODE_WIDTH,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="grid h-7 w-7 place-items-center rounded-full text-[12px] font-semibold"
          style={{ background: "var(--accent-soft)", color: "var(--ink)" }}
        >
          {d.emoji}
        </span>
        <div>
          <p className="text-[13px] font-semibold leading-tight">{d.name}</p>
          <p className="text-[11px] muted leading-tight">{d.role}</p>
        </div>
      </div>
      <p className="mt-2 text-[11px] muted">{d.speciality}</p>
    </div>
  );
}

const NODE_TYPES = { agent: AgentNode };

function buildInitial(active: string[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = AGENTS.map((a, i) => {
    const isActive = active.includes(a.id);
    return {
      id: a.id,
      type: "agent",
      position: { x: 60 + (i % 3) * (NODE_WIDTH + 60), y: 80 + Math.floor(i / 3) * 140 },
      data: {
        name: a.name,
        role: a.role,
        speciality: a.speciality,
        emoji: a.emoji,
        active: isActive,
      },
    };
  });
  const edges: Edge[] = [];
  for (let i = 0; i < active.length - 1; i += 1) {
    edges.push({
      id: `e-${active[i]}-${active[i + 1]}`,
      source: active[i],
      target: active[i + 1],
      animated: true,
      style: { stroke: "var(--ink)" },
    });
  }
  return { nodes, edges };
}

function Inner() {
  const { state, dispatch } = useWizard();
  const initial = useMemo(() => buildInitial(state.workflow), [state.workflow]);

  const [nodes, setNodes] = React.useState<Node[]>(initial.nodes);
  const [edges, setEdges] = React.useState<Edge[]>(initial.edges);

  // Keep workflow order in sync with edges (left-to-right walk).
  useEffect(() => {
    const order = topoOrder(nodes, edges);
    if (order.join(",") !== state.workflow.join(",")) {
      dispatch({ type: "SET_WORKFLOW", workflow: order });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((ns) => applyNodeChanges(changes, ns)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((es) => applyEdgeChanges(changes, es)),
    [],
  );
  const onConnect = useCallback(
    (c: Connection) =>
      setEdges((es) =>
        addEdge({ ...c, animated: true, style: { stroke: "var(--ink)" } }, es),
      ),
    [],
  );

  function toggleAgent(id: string) {
    const next = state.workflow.includes(id)
      ? state.workflow.filter((x) => x !== id)
      : [...state.workflow, id];
    dispatch({ type: "SET_WORKFLOW", workflow: next });
    setNodes((ns) =>
      ns.map((n) => (n.id === id ? { ...n, data: { ...n.data, active: next.includes(id) } } : n)),
    );
  }

  function reset() {
    const fresh = buildInitial(["pierre", "marie", "etienne", "sophie", "antoine"]);
    setNodes(fresh.nodes);
    setEdges(fresh.edges);
    dispatch({ type: "SET_WORKFLOW", workflow: ["pierre", "marie", "etienne", "sophie", "antoine"] });
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-semibold tracking-tight">Build your workflow</h2>
          <p className="muted text-[13px]">
            Drag the agents around. Connect them in the order you want them to weigh in.
            Toggle one off below if you don&apos;t want it in the room.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-secondary" onClick={reset}>Reset</button>
        </div>
      </header>

      <div className="card overflow-hidden" style={{ height: 380 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={NODE_TYPES}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={16} color="#e5e5e3" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      <div className="flex flex-wrap gap-2">
        {AGENTS.map((a) => {
          const on = state.workflow.includes(a.id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => toggleAgent(a.id)}
              className="rounded-full border px-3 py-1 text-[12px] font-medium"
              style={{
                background: on ? "var(--ink)" : "white",
                color: on ? "white" : "var(--ink)",
                borderColor: on ? "var(--ink)" : "var(--line-strong)",
              }}
            >
              {on ? "✓ " : "+ "}
              {a.name} · {a.role}
            </button>
          );
        })}
      </div>

      <Footer
        onBack={() => dispatch({ type: "BACK" })}
        onNext={() => dispatch({ type: "GOTO", step: "goal" })}
        disabled={state.workflow.length === 0}
      />
    </div>
  );
}

import React from "react";

export function WorkflowStep() {
  return (
    <ReactFlowProvider>
      <Inner />
    </ReactFlowProvider>
  );
}

function Footer({
  onBack,
  onNext,
  disabled,
}: {
  onBack: () => void;
  onNext: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-2 flex justify-between">
      <button type="button" className="btn btn-ghost" onClick={onBack}>← Back</button>
      <button type="button" className="btn" disabled={disabled} onClick={onNext}>
        Continue → State your goal
      </button>
    </div>
  );
}

/** Walk the edge graph in topological order, falling back to insertion order. */
function topoOrder(nodes: Node[], edges: Edge[]): string[] {
  const active = nodes.filter((n) => (n.data as { active?: boolean }).active).map((n) => n.id);
  if (active.length === 0) return [];
  const inDeg: Record<string, number> = Object.fromEntries(active.map((id) => [id, 0]));
  const out: Record<string, string[]> = Object.fromEntries(active.map((id) => [id, []]));
  for (const e of edges) {
    if (out[e.source] && active.includes(e.target)) {
      out[e.source].push(e.target);
      inDeg[e.target] += 1;
    }
  }
  const q = active.filter((id) => inDeg[id] === 0);
  const order: string[] = [];
  while (q.length > 0) {
    const cur = q.shift()!;
    order.push(cur);
    for (const t of out[cur]) {
      inDeg[t] -= 1;
      if (inDeg[t] === 0) q.push(t);
    }
  }
  // Fall back: append any leftover (cycles)
  for (const id of active) if (!order.includes(id)) order.push(id);
  return order;
}
