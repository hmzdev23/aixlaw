# T9 — Execution Engine + Spellbook + Notary

**Owner:** Will · **Branch:** `will` · **Depends on:** `Decision` from T8 handoff, Stripe test keys, Spellbook trial or fixtures · **Powers demo beats:** Stripe invoice, provisioning webhook, notary queue, timeline stream, Spellbook issues feed, smoke test

---

## Goal (1 paragraph)

Implement **`ExecutionEngine.fire`** as an ordered async pipeline emitting **`TimelineEvent`s** for the Cockpit footer: after CEO/signoff narrative, create **Stripe** test **invoice** or **PaymentIntent** record (document which), hit **internal provisioning webhook** to allocate **50 Enterprise seats** in a mock provider dashboard JSON, enqueue **Quebec notary** task (persisted queue file in dev), then trigger **Slack success** + **Gmail** handoff if not already done. Implement **`SpellbookClient`** to fetch clause issues for the MSA text and pass to T4 `refreshFromIssues`. Provide **`scripts/smoke-demo.ts`** or `GET /api/demo/smoke` that asserts all steps return 200 with fixtures.

---

## Sub-features (exhaustive checklist)

### Execution pipeline
- [ ] `POST /api/execution/fire` body `{ dealId }` loads latest `Decision`
- [ ] Step 1: `email_received` (immediate done — narrative)
- [ ] Step 2: `counter_sent` after workproduct success flag
- [ ] Step 3: Stripe: create customer + invoice items from `Decision.financials`
- [ ] Step 4: POST internal `/api/provisioning/allocate` with `{ seats, tier }` → updates `data/mock_saas.json`
- [ ] Step 5: `notary_queued` write job to `data/notary_queue.jsonl`
- [ ] Emit events via SSE `GET /api/execution/stream?dealId=`

### Stripe
- [ ] Use test mode keys; idempotency keys per deal
- [ ] Handle errors → `TimelineEvent.status: error` with message

### Provisioning webhook
- [ ] Mock SaaS dashboard page at `/admin/mock-provisioning` (optional UI for judges) — can be **Will + Hamza** micro PR; if UI forbidden here, JSON only

### Notary queue
- [ ] Job fields: `dealId`, `jurisdiction: QC`, `contact`, `status: queued`
- [ ] Consumer not required; display list in API `GET /api/notary/queue`

### Spellbook client
- [ ] `SPELLBOOK_API_KEY` path: `POST https://...` per Spellbook docs (placeholder URL in `.env.example`)
- [ ] Fallback: read `fixtures/spellbook_issues.json`
- [ ] Expose `GET /api/spellbook/issues?dealId=` for T4

### Smoke test
- [ ] `pnpm demo:smoke` runs sequential fetches against local server: trigger → ghost → tree → compliance sample → workproduct → execution
- [ ] Exit code non-zero on failure

---

## File / folder layout to create

```
src/lib/integrations/stripe/
  client.ts
src/lib/integrations/spellbook/
  client.ts
src/lib/execution/
  engine.ts
  timeline.ts
app/api/execution/
  fire/route.ts
  stream/route.ts
app/api/provisioning/
  allocate/route.ts
app/api/notary/
  queue/route.ts
app/api/spellbook/
  issues/route.ts
scripts/smoke-demo.mjs
```

---

## Public interfaces (typed)

- `ExecutionEngine`, `SpellbookClient` from INTEGRATION_CONTRACTS.md

---

## Implementation notes & method choices

- Stripe **Invoice** matches narrative “pending invoice” — use `collection_method: send_invoice`
- Timeline stream should **replay** last events for reconnects (keep ring buffer 20)
- Spellbook errors must **not** block demo; downgrade to fixtures with log line

---

## Acceptance criteria

- [ ] Happy path shows 5 green checkmarks in order within 10s test clock
- [ ] Stripe dashboard shows created test invoice (manual verify)
- [ ] Mock provisioning file updates seat count to 50
- [ ] Notary queue gains one entry per run
- [ ] Smoke script passes against `pnpm dev` on clean boot

---

## Demo beats this task lights up

3:05–3:20 (DEMO_SCRIPT.md)

---

## Fallback plan if behind

- Stripe → log “would create” event only; still checkmark with disclaimer flag
- Provisioning → static success
- Spellbook → fixtures only

---

## Out of scope

- Ghost/tree generation (T4), Council (T5), Compliance UI (T2/T6 visuals)
