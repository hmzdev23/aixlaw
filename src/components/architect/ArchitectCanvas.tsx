"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  Handle,
  Position,
} from "@xyflow/react";
import type { Playbook, AgentBlock, AgentBlockType } from "@/lib/contracts/models";
import {
  Shield,
  Zap,
  GitBranch,
  Users,
  Scale,
  TrendingUp,
  Globe,
  MessageSquare,
  Mail,
  CreditCard,
  Database,
  FileCheck,
  Eye,
  AlertTriangle,
} from "lucide-react";

const BLOCK_META: Record<AgentBlockType, { label: string; icon: typeof Shield; color: string }> = {
  spellbook_issue_detector: { label: "Spellbook", icon: Zap, color: "#FF4B00" },
  ghost:                    { label: "Ghost",     icon: Users, color: "#EF4444" },
  tree:                     { label: "Game Tree", icon: GitBranch, color: "#3B82F6" },
  counsel:                  { label: "Counsel",   icon: Scale, color: "#6366F1" },
  closer:                   { label: "Closer",    icon: TrendingUp, color: "#FF4B00" },
  counterpart:              { label: "Counterpart", icon: Users, color: "#EF4444" },
  compliance:               { label: "Compliance", icon: Shield, color: "#F59E0B" },
  crown:                    { label: "Crown",      icon: Users, color: "#8B5CF6" },
  truesight:                { label: "TrueSight",  icon: Eye, color: "#06B6D4" },
  osfi_vendor_management:   { label: "OSFI Vendor Mgmt", icon: Shield, color: "#F59E0B" },
  pipeda_watcher:           { label: "PIPEDA Watcher", icon: Globe, color: "#10B981" },
  law25:                    { label: "Law 25",     icon: AlertTriangle, color: "#EF4444" },
  translator:               { label: "Translator", icon: Globe, color: "#06B6D4" },
  slack_notifier:           { label: "Slack",      icon: MessageSquare, color: "#4ADE80" },
  gmail_drafter:            { label: "Gmail Draft", icon: Mail, color: "#F87171" },
  stripe_webhook:           { label: "Stripe (CAD)", icon: CreditCard, color: "#818CF8" },
  provisioning_webhook:     { label: "Provisioning", icon: Database, color: "#34D399" },
  notary_router:            { label: "Notary Queue", icon: FileCheck, color: "#A78BFA" },
  supervisor_pdf:           { label: "Supervisor PDF", icon: FileCheck, color: "#60A5FA" },
};

type AgentBlockData = AgentBlock & Record<string, unknown>;

function AgentNode({ data, selected }: { data: AgentBlockData; selected?: boolean }) {
  const meta = BLOCK_META[data.type];
  if (!meta) return null;
  const Icon = meta.icon;

  return (
    <div
      className="rounded-xl border-2 p-3 min-w-[140px] transition-shadow"
      style={{
        background: "white",
        borderColor: selected ? meta.color : "var(--color-gray-200)",
        boxShadow: selected ? `0 0 0 2px ${meta.color}40` : "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: meta.color, width: 8, height: 8 }} />
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${meta.color}15` }}
        >
          <Icon size={14} color={meta.color} />
        </div>
        <span className="text-xs font-semibold" style={{ color: "var(--color-gray-900)" }}>
          {meta.label}
        </span>
      </div>
      {data.type === "spellbook_issue_detector" && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
          style={{ background: `linear-gradient(90deg, ${meta.color}, #FF7A40)` }}
        />
      )}
      <Handle type="source" position={Position.Right} style={{ background: meta.color, width: 8, height: 8 }} />
    </div>
  );
}

const nodeTypes: NodeTypes = { agentBlock: AgentNode };

interface ArchitectCanvasProps {
  playbook: Playbook;
  onChange: (p: Playbook) => void;
  selectedNodeId?: string | null;
  onSelectNode: (id: string | null) => void;
}

export function ArchitectCanvas({ playbook, onChange, onSelectNode }: ArchitectCanvasProps) {
  const initialNodes: Node[] = useMemo(
    () =>
      playbook.blocks.map((b) => ({
        id: b.id,
        type: "agentBlock",
        position: b.position,
        data: b as AgentBlockData,
        selected: false,
      })),
    [playbook.blocks]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      playbook.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        style: { stroke: "var(--color-gray-400)", strokeWidth: 1.5 },
        animated: false,
      })),
    [playbook.edges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, style: { stroke: "var(--color-gray-400)", strokeWidth: 1.5 } }, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectNode(node.id);
    },
    [onSelectNode]
  );

  const onPaneClick = useCallback(() => {
    onSelectNode(null);
  }, [onSelectNode]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--color-gray-100)" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(n) => BLOCK_META[(n.data as AgentBlockData)?.type]?.color ?? "#aaa"}
          style={{ border: "1px solid var(--color-gray-200)", borderRadius: 8 }}
        />
      </ReactFlow>
    </div>
  );
}
