# T8 — Outbound Work Product + Voice Loop

**Owner:** Will · **Branch:** `will` · **Depends on:** `Decision` type from engine/handoff, Google Gmail draft scope, Slack webhook · **Powers demo beats:** Play Best Line docx, Supervisor PDF + Legal/Plain, voice sign-off, Slack + Gmail outbound

---

## Goal (1 paragraph)

Implement **`WorkProductService`**: generate a **real `.docx`** with track-changes-style revisions (minimum: comments + colored inserts using `docx` library) applied against **`Example Scenario (Optional)/msa_initech_redlines.md`** (parse `~~strike~~`, `**[INITECH ADD: …]**`, emit **Dunder counter-proposal** sections), reflecting the **chosen move** from Cockpit. Generate **Supervisor PDF** via **`@react-pdf/renderer`** with **Legal** vs **Plain-English** layouts (**Plain:** e.g. “Uncapped breach liability as drafted could end the company”). Implement **`VoiceSignoffService`** with pre-recorded audio and state transitions. Fire **Slack** notification and **Gmail draft** with attachment via Google APIs.

---

## Sub-features (exhaustive checklist)

### Decision handoff
- [ ] `POST /api/workproduct/decision` accepts `Decision` JSON (Zod) from UI after “Play Best Line”
- [ ] Idempotency key `dealId + moveId` to avoid duplicate docs

### DOCX
- [ ] Load base doc as template: either rebuild from paragraphs in fixture OR inject into existing file (if parser too heavy: **generate new docx** with summary + appendix quoting clauses — document choice)
- [ ] Include metadata: parties, date, move summary, financial table
- [ ] Expose `GET /api/workproduct/docx?dealId=` returning `application/vnd...`

### Supervisor PDF
- [ ] React-PDF document component `SupervisorReportPdf`
- [ ] Modes: `legal` uses defined terms; `plain` uses business phrasing prompts pre-written (static templates + fill)
- [ ] Expose `GET /api/workproduct/supervisor?dealId=&mode=`

### Voice sign-off
- [ ] States: `pending → playing → signed`
- [ ] API: `POST /api/signoff/start`, `POST /api/signoff/complete`
- [ ] Store in memory map `dealId → state`

### Slack outbound
- [ ] `OutboundNotifyService.slackDealUpdate` posts to channel webhook with locale-aware text
- [ ] Include link to internal deal page if exists

### Gmail draft
- [ ] Use Gmail API `users.drafts.create` with multipart MIME
- [ ] Attach generated docx bytes
- [ ] Pre-fill To: `procurement-legal@initechfg.demo` (see PERSONAS.md)

### Bilingual
- [ ] If `Decision.locale === 'fr'`, call T6 translate for email body + Slack (or use pre-translated templates)

---

## File / folder layout to create

```
src/lib/workproduct/
  docxBuilder.ts
  supervisorPdf.tsx
  templates/
    supervisorLegal.tsx
    supervisorPlain.tsx
src/lib/integrations/outbound/
  slack.ts
  gmailDraft.ts
app/api/workproduct/
  decision/route.ts
  docx/route.ts
  supervisor/route.ts
app/api/signoff/
  start/route.ts
  complete/route.ts
```

---

## Public interfaces (typed)

- `WorkProductService`, `VoiceSignoffService`, `OutboundNotifyService` from INTEGRATION_CONTRACTS.md

---

## Implementation notes & method choices

- `docx` lib limitations: true OOXML track changes are hard — **demo acceptable:** “Redline Summary” section + quoted replacement text; disclose in README
- PDF: keep **two page max** for punchy demo
- Gmail draft creation may require **service account** domain-wide delegation in real org — for hackathon, use **OAuth user token** from Sarah session

---

## Acceptance criteria

- [ ] Downloaded `.docx` opens in Word/Google Docs without error
- [ ] PDF renders both modes; file size &lt; 500KB
- [ ] Slack message receives within 2s of call
- [ ] Gmail draft appears in Sarah’s drafts folder (when OAuth OK)

---

## Demo beats this task lights up

2:45–3:05, 3:05–3:20 partial (with T9)

---

## Fallback plan if behind

- DOCX → PDF only for counter; still show “download”
- Gmail → `mailto:` link with pre-filled body (last resort)

---

## Out of scope

- Ghost prompts (T4), Council (T5), CanLII (T6), Stripe (T9)
