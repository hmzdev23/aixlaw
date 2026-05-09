# Consolidation gaps (task spec vs shipped)

Audit date: consolidation pass on `main`. Resolved items are wired in the **screenshot shell** (`src/components/product-ui/*`) + **`/deals/[id]/*`** routes unless noted.

| Area | Gap | Status / follow-up |
|------|-----|-------------------|
| T1 Persona switcher | Nav still mock-first; `/api/personas` exists — wire `PersonaSwitcher` to GET + cookie | Partial — API ready |
| T2 Cockpit | Full live cockpit: **`CockpitLive`** on `/deals/[id]/cockpit` (ghost, tree, walkaway, compliance, SSE, playbooks→workproduct→execution) | **Shipped** |
| T2 War Room | Static agent layout; NDJSON council + `?flex=1` AI-vs-AI stream not in shell page | Gap — use `(app)/war-room` patterns or new client stream |
| T3 Architect | `WorkflowCanvas` mock; React Flow canvas + `/api/playbooks` CRUD | Gap — `ArchitectCanvas` exists under `(app)/architect` |
| T7 Calendar | Live chip when inbound returns `calendarContext` | **Wired** via Cockpit bootstrap |
| T8 Voice | `/api/signoff/*` exists; `VoiceSignoff` still demo MP3 path | Partial |
| T9 Execution | SSE timeline in cockpit | **Wired** |
| Login | Gambit mark in `Logo`; split-screen persona OAuth | Partial |

Update this file when closing gaps.
