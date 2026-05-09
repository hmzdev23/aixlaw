# Gambit — Architecture

## Locked stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router), TypeScript strict |
| UI | React 19, Tailwind CSS v4, shadcn/ui |
| Viz | `@xyflow/react` (React-Flow) — game tree + Architect canvas |
| Motion | `framer-motion` or `motion` (per `design.MD` §14) |
| LLM | Anthropic Claude (Messages API), structured outputs where possible |
| Auth / Google | NextAuth.js v5 + Google provider (Gmail read/draft, Calendar) |
| Slack | Incoming webhooks (notify) + optional Events API / slash for demo |
| Doc gen | `docx` (npm) for `.docx`; `@react-pdf/renderer` for Supervisor PDF |
| Payments | Stripe API (test mode) |
| Legal verify | CanLII search / scrape strategy documented in T6 |
| i18n | `next-intl` or lightweight locale context + Cloud Translation API |
| Deploy | Vercel (env vars in dashboard) |

**Do not edit** root `design.MD` — consume tokens from it in T1.

---

## Repository layout (target after Sprint 0 on `main`)

```
aixlaw/
├── app/                          # Next.js routes
│   ├── (marketing)/              # Landing, Sarah cold open (T1)
│   ├── (app)/                    # Authenticated app shell
│   │   ├── cockpit/              # T2
│   │   ├── war-room/             # T3
│   │   └── architect/            # T3
│   └── api/                      # Route handlers (all owners)
│       ├── engine/               # T4–T6 (or server actions)
│       ├── integrations/         # T7–T9
│       └── webhooks/
├── src/
│   ├── components/               # Hamza: ui/, cockpit/, war-room/, architect/
│   ├── lib/
│   │   ├── contracts/            # Types mirroring docs/INTEGRATION_CONTRACTS.md
│   │   ├── engine/               # Aditya: ghost, tree, council, compliance
│   │   ├── integrations/       # Will: google, slack, stripe, translation
│   │   └── fixtures/             # Demo JSON + doc snippets
│   └── hooks/                    # Shared client hooks
├── public/
│   └── demo/                     # voice memo, static PDF previews if needed
├── docs/                         # This planning pack
└── design.MD                     # Read-only spec
```

Sprint 0 on `main` creates empty stubs + `src/lib/contracts/*` so feature branches rebase cleanly.

---

## System diagram

```mermaid
flowchart LR
  subgraph Inbound["Inbound Will T7"]
    Gmail[GmailOAuthWatcher]
    SlackIn[SlackListener]
    Cal[CalendarAPI]
    Personas[MockSSOPersonas]
  end

  subgraph Engine["Engine Aditya T4 T5 T6"]
    Ghost[CounterpartyGhost]
    Tree[GameTreeEval]
    Council[MultiAgentCouncil]
    TrueSight[TrueSightCanLII]
    Law25[Law25PIA]
    Bilingual[FR_EN_Translator]
    Runtime[ArchitectRuntime]
  end

  subgraph UI["UI Hamza T1 T2 T3"]
    Shell[ShellModeTabs]
    Cockpit[CockpitView]
    WarRoom[WarRoomView]
    Architect[ArchitectCanvas]
  end

  subgraph Outbound["Outbound Will T8 T9"]
    Docx[WordDocx]
    Pdf[SupervisorPdf]
    Voice[VoiceApproval]
    Stripe[StripeInvoice]
    Provision[ProvisioningWebhook]
    Notary[NotaryQueue]
    GmailOut[GmailDraft]
    SlackOut[SlackNotify]
  end

  Gmail --> Engine
  SlackIn --> Engine
  Cal --> Engine
  Personas --> UI
  Engine --> UI
  UI --> Outbound
  Engine --> Outbound
  Runtime --> Engine
```

---

## Data flow (happy path)

1. **Inbound:** Gmail/Slack/classifier emits `InboundEvent` → deal session created in server state or DB (Sprint 0 picks: in-memory for hackathon vs SQLite).
2. **Engine:** `GhostEngine.generate` → `TreeEngine.bloom` → optional `Compliance.check` on draft snippets → UI subscribes via SSE or polling.
3. **User action:** “Play Best Line” → `Decision` object → `WorkProduct.docx` + `WorkProduct.supervisorPdf` + `ExecutionEngine.fire`.
4. **Outbound:** Timeline events stream to Cockpit footer; Slack + Gmail draft complete the arc.

---

## Environment variables (reference)

| Variable | Owner | Purpose |
|----------|-------|---------|
| `ANTHROPIC_API_KEY` | Aditya | Claude |
| `GOOGLE_CLIENT_ID` / `SECRET` | Will | NextAuth Google |
| `NEXTAUTH_SECRET` | Will | Session |
| `SLACK_WEBHOOK_URL` / signing secret | Will | Outbound + verify inbound |
| `STRIPE_SECRET_KEY` | Will | Test invoices |
| `GOOGLE_CLOUD_TRANSLATION_KEY` or service account JSON | Aditya | FR/EN |
| `CANLII_*` or generic HTTP proxy | Aditya | TrueSight |
| `SPELLBOOK_API_KEY` (optional) | Will | Real Spellbook vs fixture |

Never commit secrets; use `.env.local` (gitignored).

---

## Task → code ownership

| Task | Primary paths |
|------|----------------|
| T1 | `app/(marketing)`, `src/components/ui`, layout, i18n shell |
| T2 | `app/(app)/cockpit`, `src/components/cockpit` |
| T3 | `app/(app)/war-room`, `architect`, `src/components/war-room`, `architect` |
| T4–T6 | `src/lib/engine/*`, `app/api/engine/*` |
| T7–T9 | `src/lib/integrations/*`, `app/api/integrations/*` |

---

## Deployment

- **Vercel:** connect repo, set env vars, Node 20+.  
- **API routes:** default serverless; long-running Council stream may use Edge-compatible patterns or chunk responses.  
- **Google OAuth:** authorized redirect URIs must include Vercel preview + production URLs.

---

## Non-goals (architecture)

- No separate Python service (stack lock: pure Next.js).  
- No editing `design.MD`.  
- Production-scale EDGAR/firm vault ingestion — out of scope; demo uses three precedent MSAs.
