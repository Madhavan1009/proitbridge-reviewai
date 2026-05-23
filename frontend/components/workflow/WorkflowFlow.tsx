"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  type Edge,
  type Node,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Github,
  Brain,
  Shield,
  Database,
  MessageSquare,
  Zap,
  CheckCircle2,
} from "lucide-react";

type NodeKind = "trigger" | "ai" | "automation" | "action" | "store";

type WorkflowNodeData = {
  label: string;
  sub: string;
  icon: React.ReactNode;
  kind: NodeKind;
};

const kindStyle: Record<NodeKind, string> = {
  trigger: "from-cyan-400/15 to-cyan-400/5 border-cyan-400/40",
  ai: "from-brand-500/20 to-brand-500/5 border-brand-400/50",
  automation: "from-amber-400/15 to-amber-400/5 border-amber-400/40",
  action: "from-white/[0.06] to-white/[0.02] border-white/15",
  store: "from-violet-400/15 to-violet-400/5 border-violet-400/40",
};

function WorkflowNode({ data }: NodeProps<WorkflowNodeData>) {
  return (
    <div
      className={
        "rounded-2xl border bg-gradient-to-br backdrop-blur-xl px-4 py-3 min-w-[210px] shadow-card " +
        kindStyle[data.kind]
      }
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-cyan-400 !border-cyan-400 !w-2 !h-2"
      />
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-navy-900/80 border border-white/10 grid place-items-center text-cyan-300">
          {data.icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400 font-semibold">
            {data.kind}
          </p>
          <p className="text-sm font-semibold text-white truncate">
            {data.label}
          </p>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
        {data.sub}
      </p>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-cyan-400 !border-cyan-400 !w-2 !h-2"
      />
    </div>
  );
}

const nodeTypes = { workflow: WorkflowNode };

export function WorkflowFlow() {
  const nodes = useMemo<Node<WorkflowNodeData>[]>(
    () => [
      {
        id: "github",
        type: "workflow",
        position: { x: 0, y: 200 },
        data: {
          label: "GitHub Webhook",
          sub: "pull_request.opened · synchronize · closed",
          icon: <Github className="h-4 w-4" />,
          kind: "trigger",
        },
      },
      {
        id: "n8n",
        type: "workflow",
        position: { x: 300, y: 200 },
        data: {
          label: "n8n Orchestrator",
          sub: "HMAC verify · fetch PR files · loop per file",
          icon: <Zap className="h-4 w-4" />,
          kind: "automation",
        },
      },
      {
        id: "claude",
        type: "workflow",
        position: { x: 620, y: 80 },
        data: {
          label: "Claude 3.5 Sonnet",
          sub: "Reviews diff · returns JSON findings",
          icon: <Brain className="h-4 w-4" />,
          kind: "ai",
        },
      },
      {
        id: "semgrep",
        type: "workflow",
        position: { x: 620, y: 320 },
        data: {
          label: "Static Analysis",
          sub: "Semgrep CLI (optional) for known patterns",
          icon: <Shield className="h-4 w-4" />,
          kind: "ai",
        },
      },
      {
        id: "github-comments",
        type: "workflow",
        position: { x: 950, y: 80 },
        data: {
          label: "Inline Comments",
          sub: "POST review comments to GitHub PR",
          icon: <MessageSquare className="h-4 w-4" />,
          kind: "action",
        },
      },
      {
        id: "postgres",
        type: "workflow",
        position: { x: 950, y: 220 },
        data: {
          label: "Postgres",
          sub: "Persist findings · track accept rate",
          icon: <Database className="h-4 w-4" />,
          kind: "store",
        },
      },
      {
        id: "summary",
        type: "workflow",
        position: { x: 950, y: 360 },
        data: {
          label: "Summary Comment",
          sub: "Verdict + finding table on the PR",
          icon: <CheckCircle2 className="h-4 w-4" />,
          kind: "action",
        },
      },
    ],
    []
  );

  const cyan = { stroke: "#22d3ee", strokeWidth: 2 };
  const blue = { stroke: "#046bd2", strokeWidth: 2 };
  const violet = { stroke: "#a78bfa", strokeWidth: 2 };

  const edges = useMemo<Edge[]>(
    () => [
      {
        id: "e1",
        source: "github",
        target: "n8n",
        animated: true,
        style: cyan,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#22d3ee" },
      },
      {
        id: "e2",
        source: "n8n",
        target: "claude",
        animated: true,
        style: cyan,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#22d3ee" },
      },
      {
        id: "e3",
        source: "n8n",
        target: "semgrep",
        animated: true,
        style: cyan,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#22d3ee" },
      },
      {
        id: "e4",
        source: "claude",
        target: "github-comments",
        animated: true,
        style: blue,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#046bd2" },
      },
      {
        id: "e5",
        source: "claude",
        target: "postgres",
        animated: true,
        style: violet,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#a78bfa" },
      },
      {
        id: "e6",
        source: "semgrep",
        target: "postgres",
        animated: true,
        style: violet,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#a78bfa" },
      },
      {
        id: "e7",
        source: "postgres",
        target: "summary",
        animated: true,
        style: blue,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#046bd2" },
      },
    ],
    []
  );

  return (
    <div className="glass-card overflow-hidden h-[560px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        zoomOnScroll={false}
        panOnScroll
        defaultEdgeOptions={{ type: "smoothstep" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="rgba(255,255,255,0.05)"
        />
        <Controls
          position="bottom-left"
          showInteractive={false}
          className="!bg-navy-900/80 !border-white/10 !rounded-xl overflow-hidden"
        />
      </ReactFlow>
    </div>
  );
}
