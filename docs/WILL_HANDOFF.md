# Will — AI Handoff Briefing

> **Audience:** the next AI assistant continuing William's work on the Gambit hackathon project (Spellbook track).
> **Goal of this doc:** let you pick up cold without re-reading every planning file. Cross-references point at the canonical doc for deeper context.
> **Last verified:** 2026-05-09 against `origin/will` @ commit `1988f07` (== `origin/main`).

---

## 1. Who you are working for

- **User:** William (`williamcallaghan`). Owner of branch `will` on the Gambit repo.
- **Repo root:** `/Users/williamcallaghan/Documents/Aixlaw/aixlaw`
- **GitHub:** `hmzdev23/aixlaw`
- **Three teammates:** Hamza (UI, branch `hamza`, T1–T3) · Aditya (engine, branch `aditya`, T4–T6) · Will (integrations, branch `will`, **T7–T9**).

You should match William's voice: pragmatic, integration-focused, allergic to scope creep into UI or LLM prompts (those are Hamza's and Aditya's lanes — see [TASK_ASSIGNMENTS.md](./TASK_ASSIGNMENTS.md) ownership rules).

---

## 2. Current repo state (snapshot)

```
main:  1988f07  docs: add challenge track and Gambit product PDFs
will:  1988f07  (== main; no work yet)
```

- **No Next.js scaffold yet.** Sprint 0 has NOT happened. Repo is just docs + fixtures.
- **No `src/`, no `app/`, no `package.json`.** See [BRANCHING_AND_GIT.md](./BRANCHING_AND_GIT.md) §"Sprint 0 on `main`".
- Read-only top-level files:
  - [`design.MD`](../design.MD) — visual spec, do not edit.
  - [`HeroVideo.MD`](../HeroVideo.MD) — single source of truth for marketing hero `<video src>`.
  - [`Example Scenario (Optional)/`](../Example%20Scenario%20%28Optional%29/) — Spellbook fixture pack (Dunder AI vs Initech NDA + MSA). **Do not edit any `.md` or `.docx` here.** New files like `precedents/*.json` are OK (Aditya owns those).
  - `Challenge Track descriptions .pdf`, `ai law e2e (non tech).pdf`, `ExampleLargeContract/NVCA-Model-SPA-...pdf` — reference only.

---

## 3. Project in 60 seconds (so you can answer judge / teammate questions)

**Gambit** = "Stockfish for deals." It's a negotiation cockpit that:
1. Models the counterparty as a **Ghost** (RAG over their precedent behavior).
2. Scores moves on a **chess-style game tree + eval bar**.
3. Has two toggles — **War Room** (multi-agent council debate) and **Architect** (drag-and-drop playbook canvas).
4. Closes the loop to **execution** (Stripe invoice, provisioning webhook, notary queue) — that last part is largely **William's job**.

**Live demo fixture:** Dunder AI Inc. (Toronto AI startup, "us") vs Initech Financial Group Inc. (regulated bank, counterparty). MSA + NDA pre-redlined by Initech sit in `Example Scenario (Optional)/`. Demo deal: **$180K CAD / 24mo** (~$7,500 CAD/mo) → first invoice narrative is **~$90K CAD**.

Full background: [PRODUCT_OVERVIEW.md](./PRODUCT_OVERVIEW.md) · [SCENARIO_CONTEXT.md](./SCENARIO_CONTEXT.md) · 3:30 demo arc in [DEMO_SCRIPT.md](./DEMO_SCRIPT.md).

---

## 4. Will's three tasks at a glance

| ID | Title | Spec | Demo beats |
|----|-------|------|------------|
| **T7** | Inbound Triggers + Auth + Personas | [tasks/07-will-inbound-auth.md](./tasks/07-will-inbound-auth.md) | 0:00–0:15 (Sarah cold open), 0:25–0:35 (calendar countdown), 3:20–3:30 (calendar cut) |
| **T8** | Outbound Work Product + Voice Loop | [tasks/08-will-outbound-work-product.md](./tasks/08-will-outbound-work-product.md) | 2:45–3:05 (Play Best Line .docx, Supervisor PDF, voice sign-off) |
| **T9** | Execution Engine + Spellbook + Notary | [tasks/09-will-execution-engine.md](./tasks/09-will-execution-engine.md) | 3:05–3:20 (Stripe CAD, provisioning, notary, Slack + Gmail outbound) |

**Ownership rule (do not violate):** Will does *integrations + file bytes + execution*. **No game-tree math, no Claude prompt engineering, no JSX layouts.**

### T7 — Inbound (most urgent)
Per [TASK_ASSIGNMENTS.md](./TASK_ASSIGNMENTS.md) merge order: `will → inbound + env wiring (T7) so others can mock` is **step 2**, right after main Sprint 0. So T7 unblocks everyone else.

Concretely:
- NextAuth v5 + Google provider with scopes `openid email profile`, `gmail.readonly`, `gmail.compose`, `calendar.readonly`.
- Gmail polling watcher → classifier → `InboundEvent` (shape in [INTEGRATION_CONTRACTS.md](./INTEGRATION_CONTRACTS.md) §1, types in [DATA_MODELS.md](./DATA_MODELS.md)).
- Slack webhook with signing-secret verification.
- Calendar `events.list` for next 8h → countdown chip data (event title + minutes, `conflict: true` if overlap).
- `POST /api/demo/trigger` body `{ documentFocus?: "nda" | "msa" }` returning a canned `InboundEvent` that loads `Example Scenario (Optional)/msa_initech_redlines.md` (default) or `nda_initech_redlines.md`.
- Personas (Sarah / Marc / Initech) → `src/lib/fixtures/personas.json`; `GAMBIT_DEMO_MODE=true` injects Sarah without OAuth.

### T8 — Outbound work product (depends on T4 `Decision` shape)
- `WorkProductService.buildCounterRedlineDocx(decision)` → real `.docx` via `docx` npm lib. **Acceptable simplification:** generate a fresh "Redline Summary" docx (parties, date, move summary, financial table, quoted replacement text per clause) instead of true OOXML track changes. Disclose in README.
- `WorkProductService.buildSupervisorPdf(decision, "legal" | "plain")` via `@react-pdf/renderer`. Two-page max. Plain mode hardcodes phrasings like *"Uncapped breach liability as drafted could end the company."*
- `VoiceSignoffService` — state machine `pending → playing → signed`, audio at `public/demo/sarah-send-it.m4a` ("Looks good. Send it.", <5s).
- `OutboundNotifyService.slackDealUpdate` (webhook) and `OutboundNotifyService.createGmailDraft` (Gmail `users.drafts.create`, multipart MIME with `.docx` attached, `To: procurement-legal@initechfg.demo`).
- Bilingual: if `Decision.locale === "fr"`, call Aditya's `Translator` (T6) — **don't roll your own**.

### T9 — Execution engine (depends on T8 work product)
`ExecutionEngine.fire(decision): AsyncIterable<TimelineEvent>` emits steps in this order, streamed via SSE on `GET /api/execution/stream?dealId=`:
1. `email_received` — narrative immediate.
2. `counter_sent` — fires after T8 docx success flag.
3. `invoice_generated` — Stripe **test mode**, currency `cad`, customer "Initech Financial Group Inc.", invoice line items match `Decision.financials` (~$7,500/mo). Demo headline ~$90K CAD installment. `collection_method: send_invoice`. Idempotency key per `dealId`.
4. `seats_provisioned` — `POST /api/provisioning/allocate { seats: 50, tier }` updates `data/mock_saas.json`.
5. `notary_queued` — append a JSON line to `data/notary_queue.jsonl` (`dealId`, `jurisdiction: QC`, `contact`, `status: queued`).

Plus:
- `SpellbookClient.detectIssues(text, { kind })` — call real Spellbook trial API if `SPELLBOOK_API_KEY` set; **fallback to `fixtures/spellbook_issues.json`** aligned to redline IDs **R01–R13** (MSA) / **N01–N05** (NDA). Errors **must not block** the demo.
- `scripts/smoke-demo.mjs` (or `GET /api/demo/smoke`) sequentially hits trigger → ghost → tree → compliance → workproduct → execution; non-zero exit on failure.

---

## 5. The contracts you cannot break

These are **the seams** between Will, Aditya, and Hamza. Codify them in `src/lib/contracts/*.ts` during Sprint 0 and **don't change without all three owners' ack** ([BRANCHING_AND_GIT.md](./BRANCHING_AND_GIT.md) "Do-not-touch zones").

Full spec: [INTEGRATION_CONTRACTS.md](./INTEGRATION_CONTRACTS.md) · [DATA_MODELS.md](./DATA_MODELS.md). The non-negotiable shapes for William's work are:

```ts
// src/lib/contracts/inbound.ts
export const FIXTURE_DIR = "Example Scenario (Optional)";

export type InboundSource = "gmail" | "slack" | "calendar" | "manual_demo";
export type InboundDocumentFocus = "nda" | "msa";

export interface InboundEvent {
  id: string;
  source: InboundSource;
  receivedAt: string;
  personaId: string;
  dealId: string;
  subject?: string;
  attachments: { name: string; mime: string; storageKey: string }[];
  rawSnippet?: string;
  documentFocus?: InboundDocumentFocus;
  calendarContext?: { nextHardStop: string; eventTitle: string; conflict: boolean };
}

// Decision is produced by the UI after "Play Best Line" — Will consumes it.
export interface Decision {
  dealId: string;
  chosenMoveId: string;
  counterpartyId: string;
  summaryLegal: string;
  summaryPlain: string;
  financials: {
    currency: "CAD" | "USD";   // CAD for Initech
    monthlyAmount: number;     // ~7500
    netDays: number;           // 60 per Initech redline
    months: number;            // 24
    tier: string;
    seats: number;             // 50 in narrative
    totalContractCad?: number; // ~180000
  };
  complianceFlags: string[];
  citationsUsed: { title: string; citation: string }[];
  generatedRedlineDocxRef?: string;
  supervisorPdfRef?: string;
}

export type TimelineStep =
  | "email_received" | "counter_sent" | "invoice_generated"
  | "seats_provisioned" | "notary_queued";

export interface TimelineEvent {
  step: TimelineStep;
  status: "pending" | "done" | "error";
  at?: string;
  detail?: string;
}

export interface SpellbookIssue {
  id: string;          // e.g. "R03" / "N01"
  clauseRef: string;
  severity: "low" | "medium" | "high";
  title: string;
  detail: string;
}
```

---

## 6. Stack lock — do not deviate

From [ARCHITECTURE.md](./ARCHITECTURE.md):

| Concern | Tool | Will's relevance |
|---------|------|------------------|
| Framework | Next.js 15 App Router, TypeScript strict | All routes under `app/api/*` |
| Auth | NextAuth v5 + Google provider | T7 |
| Slack | Incoming webhooks; Events API verify with signing secret | T7 / T8 |
| Doc gen | `docx` (npm) | T8 — use this, don't reach for Pandoc/etc |
| PDF gen | `@react-pdf/renderer` | T8 |
| Payments | Stripe API test mode, **CAD** | T9 |
| Deploy | Vercel | env vars in dashboard |

**Not allowed:** separate Python service, swapping the docx lib, hand-rolled OAuth.

---

## 7. Environment variables you own

Add to `.env.example` during Sprint 0 (do not commit real values):

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
SLACK_WEBHOOK_URL=
SLACK_SIGNING_SECRET=
STRIPE_SECRET_KEY=
SPELLBOOK_API_KEY=               # optional; fallback to fixtures
GAMBIT_DEMO_MODE=true            # bypass Google OAuth, inject Sarah
DEMO_EMAIL_SARAH=sarah@dunderai.demo
DEMO_EMAIL_MARC=marc@dunderai.demo
DEMO_EMAIL_INITECH=procurement-legal@initechfg.demo
```

Authorized OAuth redirect URIs must include localhost + Vercel preview + Vercel production.

---

## 8. Personas (mock SSO)

Full doc: [PERSONAS.md](./PERSONAS.md).

| id | Name | Email | Role | Demo action |
|----|------|-------|------|-------------|
| `persona_sarah` | Sarah Chen | `sarah@dunderai.demo` | `cofounder_coo` | Triggers Play Best Line; plays voice memo; hits Send |
| `persona_marc` | Marc Tremblay | `marc@dunderai.demo` | `gc` | Supervisor PDF "Legal mode" reviewer; voice sign-off attribution |
| `persona_initech` | Initech Procurement Counsel | `procurement-legal@initechfg.demo` | `counterparty_legal` | From-address on simulated inbound; Slack bot name |

Seed at `src/lib/fixtures/personas.json`. Persona switcher gated by `NODE_ENV` or demo flag. Persistence key: `localStorage["gambit_persona"]`.

---

## 9. Recommended order of operations

The merge order in [TASK_ASSIGNMENTS.md](./TASK_ASSIGNMENTS.md) is:

1. `main` Sprint 0 (Next.js scaffold + `src/lib/contracts/*` + `.env.example`).
2. **`will` → T7** so others can mock against real `InboundEvent` shape.
3. `aditya` → engine APIs returning fixture-shaped JSON.
4. `hamza` → UI wired to APIs.
5. T8 + T9 + polish.

**Right now Sprint 0 is not done.** Two reasonable options for Will:

**Option A (recommended) — do Sprint 0 yourself on a small `main` PR:**
- `pnpm create next-app@latest .` (TypeScript, Tailwind, App Router, no src dir? — match [ARCHITECTURE.md](./ARCHITECTURE.md) §"Repository layout" which uses `src/` AND `app/`).
- Initialize shadcn (`pnpm dlx shadcn@latest init`).
- Create `src/lib/contracts/` files mirroring [DATA_MODELS.md](./DATA_MODELS.md) + [INTEGRATION_CONTRACTS.md](./INTEGRATION_CONTRACTS.md). Export `CONTRACT_VERSION = "1.0.0"`.
- Create `src/lib/fixtures/README.md` + empty placeholder JSON.
- `.env.example` (see §7).
- Commit prefix: `[main] chore: sprint 0 scaffold + contracts`.
- PR to `main`, merge, then `git checkout will && git rebase main`.

**Option B — wait for Hamza or Aditya to do Sprint 0**, then start T7 on the freshly-rebased `will` branch.

If Sprint 0 is already done by the time you read this, skip to T7 directly.

### T7 first PR scope (so Aditya / Hamza can mock):
1. `src/lib/integrations/inbound/service.ts` — implements `InboundService` from contracts.
2. `app/api/demo/trigger/route.ts` — manual fallback that works **without** Google OAuth on venue Wi-Fi.
3. `src/lib/fixtures/personas.json` + `app/api/personas/route.ts`.
4. NextAuth route + Google provider behind `GAMBIT_DEMO_MODE`.
5. Defer Gmail polling and Slack signature until 1+2+3 ship.

Commit prefix examples (from [BRANCHING_AND_GIT.md](./BRANCHING_AND_GIT.md)):
```
[T7] feat(integrations): inbound contract + manual demo trigger
[T7] feat(auth): nextauth google provider behind demo flag
[T7] feat(integrations): gmail polling watcher
```

---

## 10. Critical fixture details (memorize these)

From [DEMO_FIXTURES.md](./DEMO_FIXTURES.md) + [SCENARIO_CONTEXT.md](./SCENARIO_CONTEXT.md):

- **Redline marker format** (you'll see it in MSA/NDA fixtures and parse in T8):
  - `~~strikethrough~~` = Initech deleted.
  - `**[INITECH ADD: text]**` = Initech added.
  - `*[INITECH COMMENT: …]*` = internal comment.
- **MSA tension map → IDs `R01`–`R13`**, NDA `N01`–`N05`. Use these as `SpellbookIssue.id` + `RedlineChange.id`.
- **Existential clauses for Dunder:** uncapped breach liability (R03), convenience termination (R09), IP on custom work (R05), 24/7 support + audit + step-in (R02 + R10 + R13).
- **Stripe test card:** `4242 4242 4242 4242`. Currency literal `"cad"`. Demo invoice ~$90,000 CAD.
- **Voice file:** `public/demo/sarah-send-it.m4a`, transcript `"Looks good. Send it."`, <5s. Sign-off button enables on `<audio>.ended`.
- **Hero video URL:** read **character-for-character** from `HeroVideo.MD` — do not paste from elsewhere.
- **CanLII demo inject (T6 owns this, but you'll see it):** bad citation `Beaulieu v. Provincial Insurance, 2021 QCCA 412` (fictional) → substitute `Bhasin v. Hrynew, 2014 SCC 71`.

---

## 11. Demo arc Will visibly powers (3:30 total)

From [DEMO_SCRIPT.md](./DEMO_SCRIPT.md):

| Beat | Time | Will's piece |
|------|------|--------------|
| Sarah cold open | 0:00–0:15 | Persona / inbox load (T7) |
| Calendar countdown | 0:25–0:35 | Calendar API or fixture chip (T7) |
| Play Best Line .docx | 2:45–2:55 | Counter-redline docx (T8) |
| Supervisor + voice | 2:55–3:05 | PDF Legal/Plain toggle + audio sign-off (T8) |
| Execution engine | 3:05–3:20 | Stripe CAD + provisioning + notary + Slack/Gmail (T9) — **the climax** |
| Calendar cut | 3:20–3:30 | "5:47 PM — made it before 6 PM board" (T7) |

If anything is going to make or break Will's contribution to the demo, it's the **3:05–3:20 execution timeline**: five green checkmarks streaming in within ~10s. Optimize for that beat.

---

## 12. Fallback plans (rehearse before stage)

Per each task's "Fallback plan if behind" section:

- **T7:** Gmail off → only `manual_demo` button + preloaded attachment path. Slack off → "simulated ping" button.
- **T8:** Skip docx → counter as PDF only. Gmail draft → `mailto:` link with pre-filled body (last resort).
- **T9:** Stripe error → log "would create" event with disclaimer flag, still checkmark. Provisioning → static success. Spellbook → fixtures only.

`SpellbookClient` errors must **never** block the timeline.

---

## 13. Risks specifically on Will's plate

From [RISK_REGISTER.md](./RISK_REGISTER.md):

| ID | Risk | Mitigation |
|----|------|-----------|
| E1 | Gmail OAuth flaky on venue Wi-Fi | `manual_demo` route + cached thread |
| R6 | Spellbook sponsors feel competed-with | Position Spellbook as **first Architect node** ("issue detection before engine"); credit them by name in inbound notify copy |
| E4 | Merge conflicts on `contracts/` | Single PR owner for `src/lib/contracts`; tiny focused PRs only |

---

## 14. What to NOT touch

- `design.MD` (read-only; Hamza consumes tokens from it in T1).
- `Example Scenario (Optional)/*.md` and `*.docx` (Spellbook's pack — **adding** `precedents/*.json` is fine; **editing** existing files is not).
- Anything under `src/lib/engine/*` once Aditya creates it (T4–T6).
- Anything under `app/(app)/cockpit/*`, `app/(app)/war-room/*`, `app/(app)/architect/*`, `src/components/*` once Hamza creates it (T1–T3) — those are UI layouts.
- `HeroVideo.MD` URL — change only with team agreement.

---

## 15. When the user comes back

If William resumes the conversation, he'll likely want to:
1. Pick up wherever the last commit on `will` left off (`git log will`).
2. Have you continue T7 → T8 → T9 in that order.
3. Be reminded of what Aditya / Hamza are blocking on (probably the `InboundEvent` shape and the `Decision` consumer endpoints).

If credits are tight, prioritize in this order:
1. Sprint 0 contracts compile (unblocks both teammates).
2. T7 manual demo trigger + persona fixture (unblocks demo on hostile Wi-Fi).
3. T9 Stripe + timeline SSE (the climax beat).
4. T8 docx + supervisor PDF.
5. T7 Gmail polling + Slack webhook (only if everything above is green).

Don't over-engineer. The hackathon judges remember the demo, not the architecture.

---

## 16. Trust-but-verify checklist before claiming a task is done

Before marking T7 / T8 / T9 done, verify each task spec's "Acceptance criteria" — re-read [tasks/07-will-inbound-auth.md](./tasks/07-will-inbound-auth.md) §Acceptance, [tasks/08-will-outbound-work-product.md](./tasks/08-will-outbound-work-product.md) §Acceptance, [tasks/09-will-execution-engine.md](./tasks/09-will-execution-engine.md) §Acceptance.

Quick sanity sweep:
- [ ] `pnpm typecheck` clean.
- [ ] `pnpm demo:smoke` returns exit 0 against `pnpm dev`.
- [ ] Manual demo trigger works **with Wi-Fi unplugged**.
- [ ] Generated `.docx` opens in Word/Google Docs without error.
- [ ] Supervisor PDF < 500KB, both modes render.
- [ ] Stripe dashboard shows test invoice in CAD (manual verify).
- [ ] `data/mock_saas.json` shows seat count = 50.
- [ ] `data/notary_queue.jsonl` has one new line per execution run.
- [ ] All env vars in `.env.example`; no secrets in commits.

---

## 17. Useful commands

```bash
# Sync with everyone
git fetch origin && git checkout will && git rebase origin/main

# Per-task commit prefix
git commit -m "[T7] feat(integrations): gmail polling watcher"

# After Sprint 0 (when package.json exists)
pnpm install
pnpm dev               # localhost:3000
pnpm typecheck
pnpm demo:smoke        # T9 wires this up
```

---

## 18. Where the canonical answer lives

If you need more depth than this handoff:

| Question | Doc |
|----------|-----|
| Why are we building this? | [PRODUCT_OVERVIEW.md](./PRODUCT_OVERVIEW.md) |
| What's the deal scenario? | [SCENARIO_CONTEXT.md](./SCENARIO_CONTEXT.md) |
| What's the system diagram + folder layout? | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| What types and shapes do I have to match? | [DATA_MODELS.md](./DATA_MODELS.md) + [INTEGRATION_CONTRACTS.md](./INTEGRATION_CONTRACTS.md) |
| How do branches and commits work? | [BRANCHING_AND_GIT.md](./BRANCHING_AND_GIT.md) |
| What's the demo arc minute-by-minute? | [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) |
| What's in the fixture pack and what do redline IDs mean? | [DEMO_FIXTURES.md](./DEMO_FIXTURES.md) |
| Who plays whom in the demo? | [PERSONAS.md](./PERSONAS.md) |
| What's expected to break and why? | [RISK_REGISTER.md](./RISK_REGISTER.md) |

Always cross-check this handoff against the canonical doc — this file freezes context as of 2026-05-09 and may drift.

---

*End of handoff.*
