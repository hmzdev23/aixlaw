# T2 — Cockpit UI

**Owner:** Hamza · **Branch:** `hamza` · **Depends on:** T1 shell, contract types for `GameTree`, `GhostProfile`, `TimelineEvent` · **Powers demo beats:** Pile, eval, calendar, Ghost, bloom, walkaway, TrueSight UI, Law25, Play Best Line, docx/pdf panes, voice, execution timeline

---

## Goal (1 paragraph)

Build the **hero Cockpit** layout: center **redline pile** (12 changes), right **eval bar** + **Ghost card**, bottom **walkaway line**, **React-Flow game tree** (“bloom”), **calendar deadline** chip, **Law 25 / PIA** slide-over, **TrueSight** strikethrough overlay region, **Play Best Line** CTA, side panes for **.docx preview** and **Supervisor PDF** with Legal/Plain toggle, **voice memo** player + sign-off affordance, and **execution timeline** footer. All data via **props or SWR/React Query** from Will/Aditya APIs — no business logic duplication.

---

## Sub-features (exhaustive checklist)

### Layout
- [ ] Responsive grid: ≥1280px three-column (pile | tree | stack); collapse tree below on tablet
- [ ] Panel resize handles (optional `react-resizable-panels`)

### Redline pile
- [ ] List 12 `RedlineChange` rows with clause ref, summary, diff highlight (use `<mark>` or diff lib in T2 scope: **display only**)
- [ ] Click row → scroll tree focus / emit `onRedlineSelect`

### Eval bar
- [ ] Vertical or horizontal bar mapped from `evalScore` (−4 to +4 scale with clamp)
- [ ] Animate on hover branch (call `onPreviewScore` from parent)

### Ghost card
- [ ] Roster-style entrance (Framer Motion)
- [ ] Fields: name, ELO, style, lists, training summary — from `GhostProfile`

### Game tree (React-Flow)
- [ ] Nodes: root + three primary children + optional depth
- [ ] Edge labels with chess notation `!!` `?!` `??`
- [ ] Hover node → fetch or show `ghostReplyPreview` (debounced API call from parent)
- [ ] “Play Best Line” highlights path (receive `highlightedNodeIds` from API)

### Walkaway line
- [ ] Horizontal rule with label; popovers for each `WalkawayCitation`

### Calendar pane
- [ ] Countdown to `nextHardStop` from `InboundEvent.calendarContext` or fixture

### TrueSight UI
- [ ] Inline text region that accepts `ComplianceReport.trueSight` and renders strikethrough + badge “Hallucination caught”
- [ ] Do **not** implement CanLII — display only

### Law 25 + PIA
- [ ] Trapdoor banner when `law25.triggered`
- [ ] Sheet with bilingual tabs EN/FR for `PIA.sections*`

### Work product panes
- [ ] `.docx`: use `docx-preview` in iframe or mammoth HTML preview — **coordinate with Will** for blob URL endpoint `GET /api/workproduct/docx?dealId=`
- [ ] PDF: `<iframe src={pdfUrl}>` or `react-pdf` viewer

### Voice + sign-off
- [ ] `<audio src="/demo/sarah-send-it.mp3" controls />` + “Mark signed” disabled until `ended` or skip for rehearsal
- [ ] Call Will API `VoiceSignoffService`

### Execution timeline
- [ ] Five steps: email_received → counter_sent → invoice_generated → seats_provisioned → notary_queued
- [ ] Subscribe to SSE or poll `GET /api/execution/stream?dealId=` (Will implements)

---

## File / folder layout to create

```
app/(app)/cockpit/page.tsx
src/components/cockpit/
  CockpitLayout.tsx
  RedlinePile.tsx
  EvalBar.tsx
  GhostCard.tsx
  GameTreeBoard.tsx      # React-Flow wrapper
  WalkawayLine.tsx
  CalendarChip.tsx
  TrueSightLayer.tsx
  Law25Panel.tsx
  WorkProductPane.tsx
  VoiceSignoff.tsx
  ExecutionTimeline.tsx
src/hooks/useCockpitData.ts  # fetches deal, tree, ghost, compliance
```

---

## Public interfaces (typed)

- Props mirror API responses: `DealSession`, `GameTree`, `GhostProfile`, `ComplianceReport`, `Decision`, `TimelineEvent[]`
- Events: `onPlayBestLine(): void`, `onBranchHover(nodeId: string): void`

---

## Implementation notes & method choices

- React-Flow: use `fitView` on tree load; lock pan during demo if needed (`nodesDraggable={false}` for polish).
- Keep **Framer** subtle — professional, not cartoon (RISK_REGISTER R4).
- TrueSight red glow: CSS `text-decoration: line-through` + `::after` badge.

---

## Acceptance criteria

- [ ] All 12 redlines visible without scroll on 1080p (or compact mode)
- [ ] Tree shows three branches with notation and tooltips
- [ ] Walkaway popovers show three citations when data present
- [ ] Timeline animates checkmarks when events arrive (mock stream OK in dev)
- [ ] No Claude/env secrets in frontend bundle

---

## Demo beats this task lights up

0:15–1:40, 2:45–3:20 (see DEMO_SCRIPT.md)

---

## Fallback plan if behind

- Static PNG for PDF; link download only
- Tree: pre-rendered SVG snapshot + fake hover tooltip
- Voice: button “Simulate approval”

---

## Out of scope

- Ghost generation, CanLII, Stripe, Gmail OAuth, Claude prompts, Architect editing
