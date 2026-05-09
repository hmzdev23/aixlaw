# Gambit — Hamza Dev Handoff

**Branch:** `hamza-dev` | **Date:** 2026-05-09 | **Dev server:** `http://localhost:3002`

## What's built (T1 + T2 + T3 — Hamza's tasks)

### T1 — Foundation & Marketing Shell ✅
- Next.js 16.2.6 + Tailwind v4 + TypeScript strict
- `src/app/layout.tsx` — Inter + JetBrains Mono fonts, LocaleProvider, PersonaProvider
- `src/app/(marketing)/page.tsx` — Full marketing landing page with hero video (exact URL from `HeroVideo.MD`)
- `src/app/(marketing)/layout.tsx` — Marketing layout with AppHeader + footer
- `src/app/(app)/layout.tsx` — App shell with AppHeader + mode tabs
- **AppHeader** (`src/components/shell/AppHeader.tsx`) — sticky blur nav, logo, mode tabs, locale toggle, persona switcher
- **ModeTabs** (`src/components/shell/ModeTabs.tsx`) — route-linked `/cockpit`, `/war-room`, `/architect`
- **LocaleToggle** (`src/components/shell/LocaleToggle.tsx`) — EN/FR toggle, sets `NEXT_LOCALE` cookie
- **PersonaSwitcher** (`src/components/shell/PersonaSwitcher.tsx`) — Sarah / Marc / Initech, persists to `localStorage:gambit_persona`
- Locale context: `src/contexts/LocaleContext.tsx` → `useLocale()` hook
- Persona context: `src/contexts/PersonaContext.tsx` → `usePersonaId()` hook
- i18n strings: `src/lib/i18n/config.ts` — EN + FR translations
- 404 page: `src/app/not-found.tsx`
- All design tokens from `design.MD` in `src/app/globals.css`
- Hero video URL: character-for-character from `HeroVideo.MD`

### T2 — Cockpit UI ✅
- `src/app/(app)/cockpit/page.tsx` — Full 3-column Cockpit layout
- **RedlinePile** — 13 MSA or 5 NDA rows with severity badges, expandable diffs, `~~strike~~` / `**[INITECH ADD]**` parsing
- **EvalBar** — animated vertical bar, −4 to +4 score, updates on node hover
- **GhostCard** — INITECH PROCUREMENT · ELO 2341 · Hardline, fights/concedes/walks lists
- **GameTreeBoard** — React-Flow tree with `!!`/`?!`/`??` notation, highlighted paths
- **WalkawayLine** — red rule + 3 citation popovers from precedent data
- **CalendarChip** — live countdown to 6 PM board readout with urgency styling
- **TrueSightLayer** — strikethrough bad citation → verified SCC citation badge
- **CompliancePanel** — OSFI / PIPEDA / Law 25 tabs; Law 25 fires PIA in EN/FR (bilingual)
- **VoiceSignoff** — audio controls + "Mark Signed" (enabled after playback or Skip)
- **ExecutionTimeline** — 5 steps with animated checkmarks
- "Play Best Line" button: highlights `!!` path on game tree, animates eval to +0.8, triggers timeline
- MSA/NDA toggle in top bar
- PDF/DOCX pane stubs with integration notes for Will's T8 API

### T3 — War Room + Architect UI ✅
- `src/app/(app)/war-room/page.tsx` — Council ring + debate feed
- **CouncilRing** — 5 agents in pentagon (Counsel/Closer/Counterpart/Compliance/Crown), speech bubbles, influence bars, vote badges
- **DebateBubble** — animated chat bubbles with vote + influence delta
- Council plays 5 events (demo fixture), Crown 4–0 synthesis
- AI-vs-AI panel toggle (`?flex=1` equivalent — toggle button in UI)
- `src/app/(app)/architect/page.tsx` — React-Flow canvas
- **ArchitectCanvas** — full React-Flow with blocks, edges, connect/drag
- Default graph: Spellbook → Ghost → OSFI Vendor Mgmt → PIPEDA Watcher → Law 25 → Crown → Supervisor PDF
- **BlockPalette** — draggable block sidebar (12 block types)
- **NodeInspector** — sliders for numeric params, text inputs for string params
- **Save Playbook** modal — name + version → updates state (POST `/api/playbooks` pending T5)
- **Export JSON** — download playbook as JSON file
- MiniMap enabled in Architect canvas

## Canonical data files

| File | What it contains |
|------|-----------------|
| `src/lib/contracts/models.ts` | ALL canonical types (Persona, GameTree, ComplianceReport, Playbook, etc.) |
| `src/lib/fixtures/demo.ts` | Full demo data: Ghost, 13 MSA redlines, 5 NDA redlines, game tree, compliance report, walkaway, debate events, playbook, timeline |
| `src/lib/i18n/config.ts` | EN/FR translations |

## What needs to happen next (Aditya + Will integration)

### From Aditya (T4/T5/T6):
- `POST /api/engine/ghost` — replace `DEMO_GHOST` fixture in cockpit
- `POST /api/engine/tree/bloom` — replace `DEMO_GAME_TREE` fixture
- `GET /api/engine/tree/predict?nodeId=` — live ghost reply preview on hover
- `POST /api/engine/walkaway` — replace `DEMO_WALKAWAY`
- `POST /api/compliance/check` — replace `DEMO_COMPLIANCE`
- `GET /api/council/deliberate?moveId=&stream=true` — SSE stream for War Room (replace `DEMO_DEBATE_EVENTS`)
- `GET /api/playbooks` + `POST /api/playbooks` — Architect save/load (replace localStorage stub)

### From Will (T7/T8/T9):
- `GET /api/workproduct/docx?dealId=` — DOCX blob for cockpit pane
- `GET /api/workproduct/pdf?dealId=&mode=legal|plain` — PDF iframe src
- `GET /api/execution/stream?dealId=` — SSE for ExecutionTimeline (replace `DEMO_TIMELINE`)
- `POST /api/voice/signoff` — VoiceSignoffService integration
- Auth: `GAMBIT_DEMO_MODE=true` bypass in `.env.local`; persona email mapping

## Integration wiring points (file:line)

| Component | Prop/call to replace | Target API |
|-----------|---------------------|------------|
| `cockpit/page.tsx:35` | `DEMO_GHOST` | `/api/engine/ghost` |
| `cockpit/page.tsx:36` | `DEMO_GAME_TREE` | `/api/engine/tree/bloom` |
| `cockpit/page.tsx:37` | `DEMO_MSA_REDLINES` | fixture (Will T7 trigger) |
| `cockpit/page.tsx:40` | `DEMO_COMPLIANCE` | `/api/compliance/check` |
| `cockpit/page.tsx:41` | `DEMO_TIMELINE` | `/api/execution/stream` SSE |
| `GameTreeBoard.tsx:167` | `onNodeHover` → `onNodeHover?.(node.id)` | `/api/engine/tree/predict` |
| `war-room/page.tsx:14` | `DEMO_DEBATE_EVENTS` | `/api/council/deliberate` SSE |
| `architect/page.tsx:47` | `handleSave` | `POST /api/playbooks` |

## Environment variables needed (add to `.env.local`)

```
GAMBIT_DEMO_MODE=true
# Aditya's keys:
ANTHROPIC_API_KEY=
GOOGLE_CLOUD_TRANSLATION_KEY=
# Will's keys:
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
SLACK_WEBHOOK_URL=
STRIPE_SECRET_KEY=
```

## Running locally

```bash
node node_modules/next/dist/bin/next dev --port 3002
# Open: http://localhost:3002
```

## Known stubs / TODOs

1. `VoiceSignoff` — audio file `/public/demo/sarah-send-it.mp3` not in repo (placeholder `<audio>`)
2. DOCX/PDF panes → stub messages until Will's T8 lands
3. Architect save → localStorage only until Aditya's T5 playbook API
4. `useCouncilStream` hook not yet implemented — War Room uses replay of `DEMO_DEBATE_EVENTS`
5. `usePlaybookApi` hook not yet implemented — Architect uses local state
6. `useCockpitData` hook not yet implemented — all data from fixture

## File tree

```
src/
  app/
    layout.tsx               # root
    page.tsx                 # re-export from (marketing)/page
    not-found.tsx
    (marketing)/
      layout.tsx
      page.tsx               # landing page
    (app)/
      layout.tsx
      cockpit/page.tsx
      war-room/page.tsx
      architect/page.tsx
  components/
    shell/
      AppHeader.tsx
      ModeTabs.tsx
      LocaleToggle.tsx
      PersonaSwitcher.tsx
    cockpit/
      CalendarChip.tsx
      CompliancePanel.tsx
      EvalBar.tsx
      ExecutionTimeline.tsx
      GameTreeBoard.tsx
      GhostCard.tsx
      RedlinePile.tsx
      TrueSightLayer.tsx
      VoiceSignoff.tsx
      WalkawayLine.tsx
    war-room/
      CouncilRing.tsx
      DebateBubble.tsx
    architect/
      ArchitectCanvas.tsx
  contexts/
    LocaleContext.tsx
    PersonaContext.tsx
  lib/
    contracts/models.ts      # canonical types
    fixtures/demo.ts         # all demo data
    i18n/config.ts
```
