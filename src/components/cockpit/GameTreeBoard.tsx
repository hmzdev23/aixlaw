"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  Position,
  Handle,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { GameTree, CandidateMove } from "@/lib/contracts/models";
import { motion } from "framer-motion";

const NOTATION_COLORS: Record<string, string> = {
  "!!": "var(--color-success)",
  "!": "#60C060",
  "!?": "var(--color-warning)",
  "?!": "#FF9966",
  "??": "var(--color-error)",
};

interface MoveNodeData extends Record<string, unknown> {
  move?: CandidateMove;
  isRoot?: boolean;
  highlighted?: boolean;
}

function MoveNode({ data }: { data: MoveNodeData }) {
  const { move, isRoot, highlighted } = data;

  if (isRoot) {
    return (
      <div
        className="px-4 py-2 rounded-full text-sm font-semibold"
        style={{
          background: "linear-gradient(135deg, #FF4B00, #FF7A40)",
          color: "white",
          border: "none",
          boxShadow: "0 4px 12px rgba(255,75,0,0.3)",
        }}
      >
        Current Position
        <Handle type="source" position={Position.Bottom} style={{ background: "transparent", border: "none" }} />
      </div>
    );
  }

  if (!move) return null;
  const notationColor = NOTATION_COLORS[move.notation] ?? "var(--color-gray-600)";

  return (
    <motion.div
      animate={highlighted ? { boxShadow: "0 0 0 2px var(--color-brand), 0 8px 24px rgba(255,75,0,0.2)" } : {}}
      className="rounded-xl border p-3 cursor-pointer transition-all hover:-translate-y-0.5"
      style={{
        background: highlighted ? "var(--color-brand-muted)" : "white",
        borderColor: highlighted ? "var(--color-brand)" : "var(--color-gray-200)",
        minWidth: 180,
        maxWidth: 220,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: "transparent", border: "none" }} />

      <div className="flex items-center justify-between mb-1.5">
        <span
          className="text-sm font-bold font-mono"
          style={{ color: notationColor }}
        >
          {move.notation}
        </span>
        <span className="text-xs font-semibold" style={{ color: "var(--color-gray-400)" }}>
          {Math.round(move.closeProbability * 100)}% close
        </span>
      </div>

      <p className="text-xs font-semibold mb-1 leading-tight" style={{ color: "var(--color-gray-900)" }}>
        {move.label}
      </p>

      <p className="text-xs leading-relaxed" style={{ color: "var(--color-gray-600)" }}>
        {move.summary.slice(0, 80)}{move.summary.length > 80 ? "…" : ""}
      </p>

      {move.retainedValueCad !== undefined && (
        <p className="mt-1.5 text-xs font-semibold" style={{ color: "var(--color-success)" }}>
          CAD ${move.retainedValueCad.toLocaleString()} retained
        </p>
      )}


      <Handle type="source" position={Position.Bottom} style={{ background: "transparent", border: "none" }} />
    </motion.div>
  );
}

const nodeTypes: NodeTypes = { move: MoveNode };

interface GameTreeBoardProps {
  tree: GameTree;
  highlightedNodeIds?: string[];
  onNodeHover?: (nodeId: string) => void;
}

export function GameTreeBoard({ tree, highlightedNodeIds = [], onNodeHover }: GameTreeBoardProps) {
  const { nodes: rfNodes, edges: rfEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const LEVEL_Y: Record<number, number> = { 0: 0, 1: 140, 2: 300 };
    const LEVEL_X_SPACING: Record<number, number> = { 0: 0, 1: 280, 2: 260 };

    const rootNode = tree.nodes[tree.rootId];
    nodes.push({
      id: "root",
      type: "move",
      position: { x: 300, y: 0 },
      data: { isRoot: true } as MoveNodeData,
    });

    rootNode.childrenIds.forEach((childId, i) => {
      const child = tree.nodes[childId];
      const x = (i - 1) * LEVEL_X_SPACING[1] + 300;
      nodes.push({
        id: childId,
        type: "move",
        position: { x, y: LEVEL_Y[1] },
        data: {
          move: child.move,
          highlighted: highlightedNodeIds.includes(childId),
        } as MoveNodeData,
      });
      edges.push({
        id: `root-${childId}`,
        source: "root",
        target: childId,
        label: child.move?.notation,
        style: { stroke: NOTATION_COLORS[child.move?.notation ?? ""] ?? "var(--color-gray-400)", strokeWidth: 2 },
        labelStyle: { fill: NOTATION_COLORS[child.move?.notation ?? ""] ?? "var(--color-gray-400)", fontWeight: 700, fontSize: 12 },
      });

      child.childrenIds.forEach((grandchildId, j) => {
        const grandchild = tree.nodes[grandchildId];
        const gx = x + (j - 0.5) * LEVEL_X_SPACING[2];
        nodes.push({
          id: grandchildId,
          type: "move",
          position: { x: gx, y: LEVEL_Y[2] },
          data: {
            move: grandchild.move,
            highlighted: highlightedNodeIds.includes(grandchildId),
          } as MoveNodeData,
        });
        edges.push({
          id: `${childId}-${grandchildId}`,
          source: childId,
          target: grandchildId,
          style: { stroke: "var(--color-gray-300)", strokeWidth: 1.5 },
        });
      });
    });

    return { nodes, edges };
  }, [tree, highlightedNodeIds]);

  const onNodeMouseEnter = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.id !== "root") onNodeHover?.(node.id);
  }, [onNodeHover]);

  return (
    <div style={{ height: 380, borderColor: "var(--color-gray-200)" }} className="rounded-2xl overflow-hidden border">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        onNodeMouseEnter={onNodeMouseEnter}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--color-gray-100)" gap={24} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
