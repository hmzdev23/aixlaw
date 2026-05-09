# Feature coverage vs `ai law e2e (non tech).pdf` (Section 8 narrative)

Maps major hackathon features to **UI surface** + **API / lib**. “Shell” = screenshot product UI (`src/components/product-ui`).

| # | Feature | UI | Backend |
|---|---------|----|---------|
| 1 | Gmail / inbound | Dashboard / cockpit calendar chip | `GET /api/inbound/latest`, Gmail integration (`src/lib/integrations/google/gmail.ts`) |
| 2 | Slack | Settings / outbound | `POST /api/webhooks/slack`, `POST /api/outbound/slack` |
| 3 | Calendar hard-stop | `CalendarChip` in `CockpitLive` | `InboundCalendarContext` via inbound service |
| 4 | Counterparty Ghost | `GhostCard` | `POST /api/engine/ghost` |
| 5 | Eval bar | `EvalBar` | `POST /api/engine/eval` |
| 6 | Game tree | `GameTreeBoard` | `POST /api/engine/tree`, `GET /api/engine/counter` |
| 7 | Walkaway line | `WalkawayLine` | `GET /api/engine/walkaway` |
| 8 | TrueSight | `TrueSightLayer` | `POST /api/engine/compliance` |
| 9 | OSFI / PIPEDA / Law25 + PIA | `CompliancePanel` | `complianceService` (`src/lib/engine/compliance/*`) |
| 10 | FR/EN | PIA + translate route | `POST /api/engine/translate`, Law25/PIA templates |
| 11 | Counter `.docx` | Cockpit link | `GET /api/workproduct/docx` |
| 12 | Supervisor PDF + Plain | Cockpit + Review | `GET /api/workproduct/supervisor` |
| 13 | Voice memo sign-off | `VoiceSignoff` | `POST /api/signoff/*` |
| 14 | Stripe | Execution step | `src/lib/integrations/stripe/client.ts` |
| 15 | Provisioning | Execution step | `POST /api/provisioning/allocate` |
| 16 | Notary queue | Execution step | `GET /api/notary/queue`, engine notary route |
| 17 | Council | War room (stream optional) | `POST /api/engine/council` (NDJSON) |
| 18 | AI vs AI | Optional query view | `POST /api/engine/aivsai` |
| 19 | Architect canvas | `/deals/[id]/architect` shell | `GET/POST /api/playbooks`, execute |
| 20 | Save-as-playbook | Architect | Playbook repository |
| 21 | Spellbook issues | Dashboard digest (optional) | `GET /api/spellbook/issues` |
| 22 | SSO / personas | Login / settings | NextAuth `src/auth.ts`, `GET /api/personas` |

PDF line numbers are indicative; adjust if the source table differs.
