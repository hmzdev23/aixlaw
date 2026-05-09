# Gambit demo runbook (consolidated)

**Prep**

- `pnpm install && pnpm build && pnpm start` (or `pnpm dev`)
- Env: `GAMBIT_DEMO_MODE=true`, `GAMBIT_DISABLE_LLM=true`, `GAMBIT_DISABLE_CANLII=true` for hostile Wi‑Fi stability
- Optional smoke: `GAMBIT_BASE_URL=http://localhost:3000 pnpm demo:smoke`

**Click path**

1. Open `/` marketing page.
2. `/login` → choose persona (context) → `/dashboard`.
3. Open **`/deals/demo/cockpit`** (canonical shell cockpit).
4. Wait for load — redlines (fixture), **Ghost / Tree / Walkaway / Compliance / TrueSight** from APIs.
5. Hover tree nodes — **counter** preview line updates via `GET /api/engine/counter`.
6. **Play Best Line** — `POST /api/playbooks/pb_default/execute` → `POST /api/workproduct/decision` → `POST /api/execution/fire`; timeline fills via **SSE** `GET /api/execution/stream?dealId=demo`.
7. Download **DOCX** / **Supervisor PDF** links in cockpit (after decision stored).
8. `/deals/demo/war-room` — static council visualization (stream wiring optional).
9. `/deals/demo/review` — PDF shortcuts + clause diff shell.
10. `/settings`, `/playbooks` — shell pages; playbooks API live at `GET /api/playbooks`.

**Expected**

- Eval bar moves when hovering nodes / after Play Best Line.
- Compliance panel shows OSFI/PIPEDA triggers on full MSA text.
- Execution timeline shows five terminal steps (`done` or `error` for Stripe when no key).
