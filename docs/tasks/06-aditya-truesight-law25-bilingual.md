# T6 — TrueSight + Law 25 + Bilingual Engine

**Owner:** Aditya · **Branch:** `aditya` · **Depends on:** Text surfaces from T4/T5 (draft clauses, citations), Cloud Translation creds · **Powers demo beats:** TrueSight intercept, PIA EN/FR, bilingual copy, notary trigger signal

---

## Goal (1 paragraph)

Implement **`ComplianceService.checkProposedText`** composing **TrueSight** (citation extraction + **CanLII verification**) and **Law 25** analysis (keyword + model classification) with auto-generated **PIA** sections in **English and French**. Expose **`Translator`** helpers for FR/EN toggles across dynamic strings. Emit structured flags consumed by Cockpit (T2) and outbound copy (T8). Provide **`notaryRequired`** boolean when Quebec formalities triggers fire (demo: contract + party location fixture).

---

## Sub-features (exhaustive checklist)

### TrueSight
- [ ] Regex + NER-style extraction for citation patterns (reporters, years, neutral citations)
- [ ] `verifyCitation(claim)` → search CanLII (HTTP) or use public search endpoint; **cache results** 24h
- [ ] If not found: `status: substituted` with suggested real case from small curated allowlist **or** model-proposed + re-verify
- [ ] Return spans for UI strikethrough (`start`, `end` in draft string) — optional if hard: return full sentence replacement
- [ ] Demo inject: read `fixtures/truesight_inject.json` when `dealId=demo`

### Law 25
- [ ] Trigger list: tracking tech, IP geolocation, cross-border US subprocessors (align with redline #4)
- [ ] `Law25Result.triggered` + human-readable `triggers[]`
- [ ] `buildPIA(params)` structured sections: data categories, purposes, retention, transfers, safeguards, lawful basis
- [ ] French: base template FR + **Cloud Translation** pass EN→FR for consistency check

### Bilingual
- [ ] `Translator.toFr/toEn` with caching
- [ ] `getBilingualBundle(key)` for static UI strings optional (can stay T1)

### API
- [ ] `POST /api/engine/compliance` body: `{ text, locale }` → `ComplianceReport`
- [ ] `POST /api/engine/translate` body: `{ text, target }` → `{ text }`

### Notary signal
- [ ] `ComplianceReport` extension or separate endpoint `GET /api/engine/notary?dealId` → `{ required: boolean, reason }`
- [ ] Rule: if `partyQuebec=true` fixture flag AND agreement type MSA → `required`

---

## File / folder layout to create

```
src/lib/engine/compliance/
  trueSight.ts
  canliiClient.ts
  law25.ts
  piaGenerator.ts
  translator.ts
app/api/engine/compliance/route.ts
app/api/engine/translate/route.ts
app/api/engine/notary/route.ts
```

---

## Public interfaces (typed)

- `ComplianceService`, `Translator` from INTEGRATION_CONTRACTS.md
- Extend `ComplianceReport` only via PR updating DATA_MODELS.md

---

## Implementation notes & method choices

- CanLII: respect robots/terms; prefer **rate-limited** server cache; **never** scrape from client
- If CanLII blocked: use **offline verification table** for demo cases (SCC, QCCA samples)
- Law 25: pair regex with Claude **boolean JSON** `{"triggered":..., "reasons":[]}` for robustness
- PIA: not legal advice — prepend watermark comment in JSON for demo

---

## Acceptance criteria

- [ ] Demo inject path always produces red strikethrough + substitution
- [ ] Law 25 path generates EN+FR PIA objects with ≥5 sections each
- [ ] Translation API errors degrade to EN-only with banner flag
- [ ] `GAMBIT_DISABLE_CANLII=true` uses fixture verification

---

## Demo beats this task lights up

1:40–2:15 (DEMO_SCRIPT.md)

---

## Fallback plan if behind

- TrueSight: only demo inject, no live search
- PIA: static `pia_template.json` with manual FR

---

## Out of scope

- UI panels (T2), Gmail/Slack (T7–T8), payment execution (T9)
