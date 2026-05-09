# T7 — Inbound Triggers + Auth + Personas

**Owner:** Will · **Branch:** `will` · **Depends on:** Google Cloud OAuth consent, Slack app (optional), fixtures · **Powers demo beats:** Gmail/Slack trigger, calendar deadline, persona mapping, demo deal load

---

## Goal (1 paragraph)

Implement **real inbound integrations** where feasible: **NextAuth** with Google for **Gmail read + Calendar read** (and **Gmail compose** scope for drafts in T8). Add **Slack** endpoint (Events API or slash command) that classifies attachments as **contract redlines**. Normalize everything into **`InboundEvent`** (INTEGRATION_CONTRACTS.md). Provide **`triggerManualDemo(opts?: { documentFocus?: "nda" | "msa" })`** that loads files from **`Example Scenario (Optional)/`** instantly (`msa_initech_redlines.md` default; `nda_initech_redlines.md` optional). Map authenticated Google emails to **`Persona`** records or run **`GAMBIT_DEMO_MODE`** bypass. Surface **calendar conflict** data for Cockpit countdown.

---

## Sub-features (exhaustive checklist)

### Auth
- [ ] NextAuth v5 config with Google provider
- [ ] Scopes: `openid email profile`, `https://www.googleapis.com/auth/gmail.readonly`, `https://www.googleapis.com/auth/gmail.compose`, `https://www.googleapis.com/auth/calendar.readonly`
- [ ] Session includes `personaId` resolved from env email map
- [ ] `GAMBIT_DEMO_MODE=true` → fake session with Sarah defaults

### Gmail watcher
- [ ] Polling `users.messages.list` + `get` every N seconds **or** Pub/Sub (stretch)
- [ ] Classifier: attachment `application/vnd.openxmlformats-officedocument.wordprocessingml.document` OR subject regex `(?i)redline|MSA|comments`
- [ ] Upload attachment to **Vercel Blob** / local `tmp/` for processing key in `InboundEvent`

### Slack
- [ ] `POST /api/webhooks/slack` verifies signing secret
- [ ] Parse file share events; emit `InboundEvent` with `source: slack`

### Calendar
- [ ] `calendar.events.list` for next 8 hours; find meeting with `board|exec` keywords or fixture event id
- [ ] Compute minutes until event; `conflict: true` if deal timer overlaps

### Personas
- [ ] Seed `PERSONAS.md` into `src/lib/fixtures/personas.json`
- [ ] API `GET /api/personas` for UI switcher when not using Google mapping

### Demo trigger
- [ ] `POST /api/demo/trigger` body `{ documentFocus?: "nda" | "msa" }` → returns canned `InboundEvent` + builds `DealSession` with `FIXTURE_DIR` paths from INTEGRATION_CONTRACTS.md

### API routes
- [ ] `GET /api/inbound/latest?dealId`
- [ ] `POST /api/inbound/manual`

---

## File / folder layout to create

```
src/lib/integrations/google/
  gmail.ts
  calendar.ts
src/lib/integrations/slack/
  verify.ts
  handler.ts
src/lib/integrations/inbound/
  classifier.ts
  service.ts
app/api/auth/[...nextauth]/route.ts
app/api/webhooks/slack/route.ts
app/api/demo/trigger/route.ts
app/api/inbound/
  latest/route.ts
  manual/route.ts
```

---

## Public interfaces (typed)

- `InboundService` from INTEGRATION_CONTRACTS.md

---

## Implementation notes & method choices

- Store OAuth **refresh tokens** encrypted if persistence added; for hackathon, session-only may suffice with re-login
- Rate-limit Gmail polling to avoid quota (exponential backoff)
- Use **Zod** for Slack payload parsing; reject unknown types
- Classifier can call a **tiny Haiku** pass for “is this a redline?” — keep behind flag

---

## Acceptance criteria

- [ ] Manual demo trigger works without Google on venue Wi‑Fi
- [ ] With valid Google creds, fetching latest inbox message returns structured `InboundEvent`
- [ ] Calendar chip data matches Google test calendar event
- [ ] Slack signature verification enforced (401 on bad sig)

---

## Demo beats this task lights up

0:00–0:15 context, 0:25–0:35 calendar, 3:20–3:30 clock

---

## Fallback plan if behind

- Gmail **off**; only `manual_demo` + preloaded attachment path
- Slack **off**; show “simulated ping” button

---

## Out of scope

- Ghost/tree (T4), UI layout (T2), docx/pdf (T8), payments (T9)
