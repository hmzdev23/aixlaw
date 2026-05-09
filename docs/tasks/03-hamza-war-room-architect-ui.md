# T3 — War Room + Architect UI

**Owner:** Hamza · **Branch:** `hamza` · **Depends on:** T1, `DebateEvent`, `Playbook`, `AgentBlockType` types · **Powers demo beats:** War Room toggle, Architect toggle, optional AI-vs-AI flex

---

## Goal (1 paragraph)

Implement **War Room** as a **council visualization**: five agents around a ring, timed **speech bubbles**, **influence meters**, per-move **vote tally**, and Crown **synthesis** — driven by streaming `DebateEvent`s from Aditya. Implement **Architect** as a **React-Flow** canvas with **sidebar palette** of agent blocks, **connection edges**, **inspector sliders** for block params, **Save as Playbook** modal, and **playbook library** drawer. Default graph must **pre-load** from fixture so the canvas is never empty at demo time.

---

## Sub-features (exhaustive checklist)

### War Room
- [ ] Layout: pentagon / round table positions with icons (Lucide, stroke 1.5)
- [ ] Agent metadata: Counsel, Closer, Counterpart, Compliance, Crown — labels from PDF §5.1
- [ ] Bubble stream: consume `AsyncIterable<DebateEvent>` via fetch stream or SSE adapter (thin client hook)
- [ ] Influence meters: per-agent bar chart updating on `influenceDelta`
- [ ] Vote tally panel: grid of latest `VoteValue` per agent for selected move
- [ ] Move selector: tie to Cockpit’s three `CandidateMove` ids
- [ ] **AI-vs-AI flex view:** second eval bar + two Ghost avatars + shared clause text panel (props from T5)

### Architect
- [ ] React-Flow canvas with `nodes` mapped from `Playbook.blocks`
- [ ] Sidebar: draggable new nodes (`onDragStart` → `onDrop` on pane)
- [ ] Edge creation: connect handles; validate allowed edges (UI-only rules in T3; runtime in T5)
- [ ] Inspector: when node selected, show sliders for numeric params (`riskTolerance`, `urgency`, `mustWinClauses` weight, etc.)
- [ ] **Spellbook node** visually distinct + default edge from Start → Spellbook → Ghost
- [ ] Save modal: name + version; `POST /api/playbooks` (Will or Aditya owns route — **default: Aditya T5** persists; Hamza calls)
- [ ] Library: list `PlaybookSummary`, load into canvas
- [ ] Export/import JSON (download button) for backup

### Shared
- [ ] Mode entry animations (Framer) &lt; 300ms
- [ ] Keyboard: `Esc` closes modals

---

## File / folder layout to create

```
app/(app)/war-room/page.tsx
app/(app)/architect/page.tsx
src/components/war-room/
  CouncilRing.tsx
  AgentAvatar.tsx
  DebateBubble.tsx
  InfluenceMeters.tsx
  VoteTally.tsx
  AiVsAiArena.tsx
src/components/architect/
  ArchitectCanvas.tsx
  BlockPalette.tsx
  NodeInspector.tsx
  PlaybookModal.tsx
  PlaybookLibrary.tsx
src/hooks/useCouncilStream.ts
src/hooks/usePlaybookApi.ts
```

---

## Public interfaces (typed)

- `useCouncilStream(moveId: string): { events: DebateEvent[]; running: boolean }`
- `PlaybookCanvasProps { playbook: Playbook; onChange(p: Playbook): void }`

---

## Implementation notes & method choices

- For hackathon, **buffer DebateEvent** client-side to replay if stream drops (instant replay button).
- Architect: use **subflows** or **node types** in React-Flow for distinct icons.
- Keep animations **short** (1.2s bubble fade per PDF) — config as constants.

---

## Acceptance criteria

- [ ] War Room replays full council sequence for Move A without manual refresh
- [ ] Architect saves and reloads a playbook round-trip (API or localStorage fallback **only if** documented)
- [ ] Default workflow shows Spellbook as first operational node
- [ ] AI-vs-AI view can be hidden behind feature flag `?flex=1`

---

## Demo beats this task lights up

2:15–2:45 (DEMO_SCRIPT.md)

---

## Fallback plan if behind

- War Room: pre-baked timeline JSON, no live stream
- Architect: slider change only on one node; skip drag-from-sidebar

---

## Out of scope

- Agent prompt content, playbook execution semantics, backend persistence choice (coordinate T5)
