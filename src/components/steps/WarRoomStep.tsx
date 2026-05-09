"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWizard } from "@/components/wizard/state";
import { getAgent } from "@/lib/agents";
import { getScenario } from "@/lib/scenarios";
import type { DebateTurn, DecisionNode } from "@/lib/types";

interface ApiOption {
  id: string;
  label: string;
  detail: string;
  delta: number;
  modifiesDoc: boolean;
  hasChildren: boolean;
  losePath?: boolean;
}

export function WarRoomStep() {
  const { state, dispatch } = useWizard();
  const scenario = state.scenarioId ? getScenario(state.scenarioId) : null;
  const maxRounds = scenario?.maxDebateRounds ?? 3;
  const [busyDebate, setBusyDebate] = useState(false);
  const [busyOptions, setBusyOptions] = useState(false);
  const [options, setOptions] = useState<ApiOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const ranOnce = useRef(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-run round 0 the first time we land here.
  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;
    void runRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [state.debate.length, state.activeAgentId]);

  async function runRound() {
    if (!state.scenarioId || state.debateRound >= maxRounds) return;
    setBusyDebate(true);
    setError(null);
    try {
      const r = await fetch("/api/agents/debate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scenarioId: state.scenarioId,
          workflow: state.workflow,
          round: state.debateRound,
        }),
      });
      const j = (await r.json()) as
        | { ok: true; data: { turns: DebateTurn[]; round: number } }
        | { ok: false; error: { message: string } };
      if (!j.ok) throw new Error(j.error.message);
      for (const t of j.data.turns) {
        dispatch({ type: "SET_ACTIVE_AGENT", agentId: t.agentId });
        await sleep(280);
        dispatch({ type: "ADD_TURN", turn: t });
        dispatch({ type: "ADJUST_SCORE", delta: t.delta });
        await sleep(420);
      }
      dispatch({ type: "SET_ACTIVE_AGENT", agentId: null });
      dispatch({ type: "BUMP_ROUND" });
      await loadOptions();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyDebate(false);
    }
  }

  async function loadOptions() {
    if (!state.scenarioId) return;
    setBusyOptions(true);
    try {
      const r = await fetch("/api/agents/decide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scenarioId: state.scenarioId, path: state.decisionPath }),
      });
      const j = (await r.json()) as
        | { ok: true; data: { options: ApiOption[] } }
        | { ok: false; error: { message: string } };
      if (!j.ok) throw new Error(j.error.message);
      setOptions(j.data.options);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyOptions(false);
    }
  }

  // Reload options whenever the path changes (e.g. after rewind).
  useEffect(() => {
    void loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.decisionPath.join("/")]);

  async function chooseOption(opt: ApiOption) {
    const parent = state.decisionTree.find((n) => n.id === lastOf(state.decisionPath));
    const cumulative = (parent?.cumulativeScore ?? state.score) + opt.delta;
    const depth = state.decisionPath.length;
    const siblingIndex = options.findIndex((o) => o.id === opt.id);
    const node: DecisionNode = {
      id: opt.id,
      parentId: parent?.id ?? null,
      label: opt.label,
      detail: opt.detail,
      delta: opt.delta,
      cumulativeScore: cumulative,
      siblingIndex: Math.max(0, siblingIndex),
      depth,
    };
    dispatch({ type: "PUSH_DECISION", node });
    // Run the next debate round automatically if we still have rounds left.
    if (state.debateRound < maxRounds) {
      // Slight pause so the user sees the new node land in the tree first.
      await sleep(450);
      void runRound();
    }
  }

  function rewindTo(nodeId: string | null) {
    dispatch({ type: "REWIND_TO", nodeId });
  }

  const finished =
    state.debateRound >= maxRounds && options.length === 0 && !busyDebate;
  const onLosePath = state.decisionTree
    .filter((n) => state.decisionPath.includes(n.id))
    .some((n) => n.cumulativeScore <= -3);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-semibold tracking-tight">War Room</h2>
          <p className="muted text-[13px]">
            Goal: <em>&ldquo;{state.goal}&rdquo;</em>
            {state.activeAgentId ? (
              <span
                className="ml-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                style={{ background: "var(--ink)", color: "white" }}
              >
                <span className="pulse-dot" style={{ background: "white" }} />
                {getAgent(state.activeAgentId)?.name} is speaking…
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RoundIndicator round={state.debateRound} max={maxRounds} />
          <WinBar score={state.score} losing={onLosePath} />
        </div>
      </header>

      {error ? (
        <p className="text-[13px]" style={{ color: "var(--negative)" }}>{error}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <ChatPane
          turns={state.debate}
          activeAgentId={state.activeAgentId}
          bottomRef={chatBottomRef}
          busy={busyDebate}
        />
        <DecisionPane
          options={options}
          busy={busyOptions || busyDebate}
          onChoose={chooseOption}
          chosenCount={state.decisionPath.length}
          finished={finished}
          onContinue={() => dispatch({ type: "GOTO", step: "export" })}
        />
      </div>

      <DecisionTreeView
        tree={state.decisionTree}
        activePath={state.decisionPath}
        onRewind={rewindTo}
      />

      <div className="mt-2 flex justify-between">
        <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: "BACK" })}>
          ← Back
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => dispatch({ type: "GOTO", step: "export" })}
          disabled={state.debate.length === 0}
        >
          Continue → Export the chat
        </button>
      </div>
    </div>
  );
}

function lastOf<T>(a: T[]): T | undefined {
  return a.length === 0 ? undefined : a[a.length - 1];
}

function RoundIndicator({ round, max }: { round: number; max: number }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="muted text-[11px] uppercase tracking-widest">Round</span>
      <div className="flex items-center gap-1">
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            className="h-1.5 w-6 rounded-full"
            style={{
              background: i < round ? "var(--ink)" : "var(--line-strong)",
            }}
          />
        ))}
        <span className="muted ml-2 text-[11px] tabular-nums">
          {round}/{max}
        </span>
      </div>
    </div>
  );
}

function WinBar({ score, losing }: { score: number; losing: boolean }) {
  const positive = score >= 0;
  const widthPct = Math.min(50, Math.abs(score) * 5);
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="muted text-[11px] uppercase tracking-widest">Win bar</span>
      <div
        className="relative h-2 w-[180px] overflow-hidden rounded-full"
        style={{ background: "var(--accent-soft)" }}
      >
        <div className="absolute left-1/2 top-0 h-full w-px" style={{ background: "var(--ink-soft)" }} />
        <div
          className="absolute top-0 h-full transition-all duration-500"
          style={{
            left: positive ? "50%" : `${50 - widthPct}%`,
            width: `${widthPct}%`,
            background: positive ? "var(--positive)" : "var(--negative)",
          }}
        />
      </div>
      <span
        className="text-[14px] font-semibold tabular-nums"
        style={{ color: positive ? "var(--positive)" : "var(--negative)" }}
      >
        {positive ? "+" : ""}
        {score.toFixed(1)}
        {losing ? <span className="ml-2 text-[10px] uppercase">walk-away zone</span> : null}
      </span>
    </div>
  );
}

function ChatPane({
  turns,
  activeAgentId,
  bottomRef,
  busy,
}: {
  turns: DebateTurn[];
  activeAgentId: string | null;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  busy: boolean;
}) {
  return (
    <div className="card scroll-y px-5 py-5" style={{ height: 380 }}>
      <div className="flex flex-col gap-3">
        {turns.map((t) => {
          const a = getAgent(t.agentId);
          const isActive = activeAgentId === t.agentId;
          return (
            <div key={t.id} className="flex gap-3 fade-in">
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-semibold transition-transform"
                style={{
                  background: isActive ? "var(--ink)" : "var(--accent-soft)",
                  color: isActive ? "white" : "var(--ink)",
                  transform: isActive ? "scale(1.08)" : "scale(1)",
                }}
              >
                {a?.emoji ?? "?"}
              </span>
              <div className="flex-1">
                <p className="text-[13px]">
                  <strong className="font-semibold">{a?.name ?? t.agentId}</strong>
                  <span className="muted ml-1 text-[11px]">{a?.role}</span>
                  <span className="muted ml-1 text-[11px]">· round {t.round + 1}</span>
                  <span
                    className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums"
                    style={{
                      background:
                        t.delta > 0 ? "#eaf6ee" : t.delta < 0 ? "#fdecea" : "var(--accent-soft)",
                      color:
                        t.delta > 0 ? "var(--positive)" : t.delta < 0 ? "var(--negative)" : "var(--ink-soft)",
                    }}
                  >
                    {t.delta > 0 ? "+" : ""}{t.delta}
                  </span>
                </p>
                <p className="mt-1 text-[13px] leading-relaxed">{t.text}</p>
              </div>
            </div>
          );
        })}
        {busy && activeAgentId ? (
          <p className="flex items-center gap-2 text-[13px] muted">
            <span className="spinner" />
            {getAgent(activeAgentId)?.name} preparing…
          </p>
        ) : busy ? (
          <p className="flex items-center gap-2 text-[13px] muted">
            <span className="spinner" /> council deliberating…
          </p>
        ) : null}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function DecisionPane({
  options,
  busy,
  onChoose,
  chosenCount,
  finished,
  onContinue,
}: {
  options: ApiOption[];
  busy: boolean;
  onChoose: (o: ApiOption) => void;
  chosenCount: number;
  finished: boolean;
  onContinue: () => void;
}) {
  return (
    <div className="card flex flex-col gap-3 px-5 py-5">
      <div>
        <p className="label">Decision options</p>
        <p className="muted mt-1 text-[11px]">
          {chosenCount === 0
            ? "Pick the opening counter."
            : finished
              ? "Final round complete. Continue to export the chat."
              : `Depth ${chosenCount}. Pick the next move.`}
        </p>
      </div>
      {busy ? (
        <p className="flex items-center gap-2 text-[13px] muted">
          <span className="spinner" /> Drafting next options…
        </p>
      ) : finished && options.length === 0 ? (
        <button type="button" className="btn" onClick={onContinue}>
          Continue → Export
        </button>
      ) : options.length === 0 ? (
        <p className="muted text-[12px]">
          Branch ended. Click a node in the tree to rewind and pick differently.
        </p>
      ) : (
        options.map((o, i) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChoose(o)}
            className={`fade-in stagger-${(i % 5) + 1} rounded-lg border px-3 py-3 text-left text-[13px] transition hover:bg-[var(--accent-soft)]`}
            style={{
              borderColor: o.losePath ? "var(--negative)" : "var(--line-strong)",
              background: o.losePath ? "#fef5f4" : "white",
            }}
          >
            <p className="font-medium">{o.label}</p>
            <p className="muted mt-1 text-[12px]">{o.detail}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
              <span
                style={{
                  color: o.delta > 0 ? "var(--positive)" : o.delta < 0 ? "var(--negative)" : "var(--ink-soft)",
                }}
              >
                Win bar {o.delta > 0 ? "+" : ""}{o.delta}
              </span>
              {o.modifiesDoc ? (
                <span
                  className="rounded-full px-2 py-0.5"
                  style={{ background: "var(--accent-soft)", color: "var(--ink-soft)" }}
                >
                  ✎ edits the contract
                </span>
              ) : null}
              {o.hasChildren ? (
                <span
                  className="rounded-full px-2 py-0.5"
                  style={{ background: "var(--accent-soft)", color: "var(--ink-soft)" }}
                >
                  branches
                </span>
              ) : null}
              {o.losePath ? (
                <span
                  className="rounded-full px-2 py-0.5"
                  style={{ background: "#fdecea", color: "var(--negative)" }}
                >
                  walk-away path
                </span>
              ) : null}
            </div>
          </button>
        ))
      )}
    </div>
  );
}

interface LayoutNode extends DecisionNode {
  x: number;
  y: number;
  active: boolean;
}

function layoutTree(
  tree: DecisionNode[],
  activePath: string[],
): { nodes: LayoutNode[]; width: number; height: number } {
  if (tree.length === 0) return { nodes: [], width: 0, height: 0 };
  const COL = 240;
  const ROW = 72;
  const PAD = 24;
  const byDepth = new Map<number, DecisionNode[]>();
  for (const n of tree) {
    if (!byDepth.has(n.depth)) byDepth.set(n.depth, []);
    byDepth.get(n.depth)!.push(n);
  }
  const nodes: LayoutNode[] = [];
  let maxRow = 0;
  Array.from(byDepth.keys())
    .sort((a, b) => a - b)
    .forEach((depth) => {
      const list = byDepth.get(depth)!;
      list.forEach((n, i) => {
        nodes.push({
          ...n,
          x: PAD + depth * COL,
          y: PAD + i * ROW,
          active: activePath.includes(n.id),
        });
        if (i > maxRow) maxRow = i;
      });
    });
  const maxDepth = Math.max(...nodes.map((n) => n.depth));
  return {
    nodes,
    width: PAD * 2 + (maxDepth + 1) * COL,
    height: PAD * 2 + (maxRow + 1) * ROW,
  };
}

function DecisionTreeView({
  tree,
  activePath,
  onRewind,
}: {
  tree: DecisionNode[];
  activePath: string[];
  onRewind: (nodeId: string | null) => void;
}) {
  const layout = useMemo(() => layoutTree(tree, activePath), [tree, activePath]);
  if (tree.length === 0) {
    return (
      <div className="card px-5 py-4">
        <p className="label">Decision tree</p>
        <p className="muted mt-2 text-[12px]">
          No picks yet. Choose an option above and a tree builds here, click any
          past node to rewind and try a different branch.
        </p>
      </div>
    );
  }
  const ROOT_X = 24;
  const ROOT_Y = 24;
  return (
    <div className="card px-5 py-4">
      <div className="flex items-center justify-between">
        <p className="label">Decision tree</p>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ height: 28, padding: "0 12px" }}
          onClick={() => onRewind(null)}
        >
          Reset to start
        </button>
      </div>
      <div className="scroll-y mt-3" style={{ overflowX: "auto" }}>
        <svg
          width={Math.max(layout.width, 320)}
          height={Math.max(layout.height, 100)}
          aria-label="Decision tree"
          style={{ display: "block" }}
        >
          <circle cx={ROOT_X} cy={ROOT_Y} r={6} fill="var(--ink)" />
          <text x={ROOT_X + 12} y={ROOT_Y + 4} fontSize={11} fill="var(--ink-soft)">
            start
          </text>
          {layout.nodes.map((n) => {
            const parent = n.parentId ? layout.nodes.find((x) => x.id === n.parentId) : null;
            const px = parent ? parent.x + 90 : ROOT_X;
            const py = parent ? parent.y + 18 : ROOT_Y;
            const onActive =
              activePath.includes(n.id) && (parent ? activePath.includes(parent.id) : true);
            return (
              <line
                key={`e_${n.id}`}
                x1={px}
                y1={py}
                x2={n.x}
                y2={n.y + 18}
                stroke={onActive ? "var(--ink)" : "var(--line-strong)"}
                strokeWidth={onActive ? 1.6 : 1}
              />
            );
          })}
          {layout.nodes.map((n) => {
            const lose = n.cumulativeScore <= -3;
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                style={{ cursor: "pointer" }}
                onClick={() => onRewind(n.id)}
              >
                <rect
                  width={200}
                  height={36}
                  rx={8}
                  fill={n.active ? "var(--ink)" : lose ? "#fef5f4" : "white"}
                  stroke={n.active ? "var(--ink)" : lose ? "var(--negative)" : "var(--line-strong)"}
                  strokeWidth={1}
                />
                <text
                  x={10}
                  y={14}
                  fontSize={10}
                  fontWeight={600}
                  fill={n.active ? "white" : lose ? "var(--negative)" : "var(--ink-soft)"}
                >
                  {n.delta > 0 ? "+" : ""}{n.delta} · cum {n.cumulativeScore.toFixed(1)}
                </text>
                <text
                  x={10}
                  y={28}
                  fontSize={11}
                  fontWeight={500}
                  fill={n.active ? "white" : "var(--ink)"}
                >
                  {truncate(n.label, 28)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="muted mt-2 text-[11px]">
        Click any node to rewind. Picks made after that node are dropped, choose
        a different next option to branch the path. Red nodes are walk-away
        territory.
      </p>
    </div>
  );
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n - 1)}…`;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
