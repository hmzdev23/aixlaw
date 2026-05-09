# T6 — TrueSight + Multi-Regime Compliance + Bilingual Engine

**Owner:** Aditya · **Branch:** `aditya` · **Depends on:** Text surfaces from T4/T5 (draft clauses, citations), Cloud Translation creds · **Powers demo beats:** TrueSight intercept, **OSFI + PIPEDA + Law 25** outputs, PIA EN/FR, bilingual copy, notary trigger signal

---

## Goal (1 paragraph)

Implement **`ComplianceService.checkProposedText`** returning a unified **`ComplianceReport`**: **TrueSight** (CanLII verification), **OsfiResult** (third-party / operational resilience **themes** aligned to Initech’s posture — cite as risk assessment not legal advice), **PipedaResult** (PIPEDA accountability, cross-border, retention), and **Law25Result** (secondary demo beat: contrived **US subprocessor + Quebec-impacted data** per DEMO_SCRIPT). Auto-generate **PIA** sections **EN + FR** when Law 25 triggers. Expose **`Translator`** for FR/EN toggles. Consumed by Cockpit **CompliancePanel** (T2) and outbound copy (T8).

---

## Sub-features (exhaustive checklist)

### TrueSight
- [ ] Regex + NER-style extraction for citation patterns (reporters, years, neutral citations)
- [ ] `verifyCitation(claim)` → search CanLII (HTTP) or use public search endpoint; **cache results** 24h
- [ ] If not found: `status: substituted` with suggested real case from small curated allowlist **or** model-proposed + re-verify
- [ ] Return spans for UI strikethrough (`start`, `end` in draft string) — optional if hard: return full sentence replacement
- [ ] Demo inject: read `fixtures/truesight_inject.json` when `dealId=demo`

### OSFI (theme engine, not a law firm opinion)
- [ ] Parse signals from **`msa_initech_redlines.md`**: insurance minimums ($5M CGL, $5M E&O, $10M cyber), **24h** breach notification, **Ontario-only** data / no cross-border without consent, **audit** (48h notice, 2×/yr), **step-in** rights
- [ ] Emit `OsfiResult { triggered, triggers[], notes? }` — `triggered: true` when ≥N enterprise risk signals present
- [ ] UI disclaimer string id: `osfi_disclaimer` (watermark / footer)

### PIPEDA
- [ ] Flags: cross-border transfer without consent language, accountability / safeguards (ISO 27001 / SOC 2 refs), retention / breach reporting alignment
- [ ] Emit `PipedaResult` same shape as `OsfiResult`

### Law 25 (secondary)
- [ ] Trigger: explicit **US-hosted analytics subprocessor** + **Quebec customer / branch** data exposure (hypo line injected for demo — see RISK_REGISTER R7)
- [ ] `Law25Result.triggered` + `triggers[]`
- [ ] `buildPIA(params)` structured sections: categories, purposes, retention, transfers, safeguards, lawful basis — **EN + FR**
- [ ] French: base template FR + **Cloud Translation** EN→FR consistency pass

### Bilingual
- [ ] `Translator.toFr/toEn` with caching
- [ ] `getBilingualBundle(key)` optional (can stay T1)

### API
- [ ] `POST /api/engine/compliance` body: `{ text, locale }` → `ComplianceReport` (**trueSight, osfi, pipeda, law25**)
- [ ] `POST /api/engine/translate` body: `{ text, target }` → `{ text }`

### Notary signal
- [ ] `GET /api/engine/notary?dealId` → `{ required: boolean, reason }`
- [ ] Rule: Quebec formalities **or** Law25 + `partyQuebec=true` fixture flag → `required` for demo narrative

---

## File / folder layout to create

```
src/lib/engine/compliance/
  trueSight.ts
  canliiClient.ts
  osfi.ts
  pipeda.ts
  law25.ts
  piaGenerator.ts
  translator.ts
  complianceService.ts
app/api/engine/compliance/route.ts
app/api/engine/translate/route.ts
app/api/engine/notary/route.ts
```

---

## Public interfaces (typed)

- `ComplianceService`, `Translator` from INTEGRATION_CONTRACTS.md  
- `ComplianceReport` = `{ trueSight, osfi, pipeda, law25 }` per DATA_MODELS.md

---

## Implementation notes & method choices

- CanLII: respect terms; **server-side only** cache  
- OSFI: reference **“third-party risk themes”** tied to scenario text — avoid citing paragraph numbers unless verified against published guidance  
- Law 25: **label** demo trigger in API metadata `demoExtension: true` for honesty in Q&A

---

## Acceptance criteria

- [ ] Demo inject path always produces TrueSight substitution  
- [ ] OSFI + PIPEDA return non-empty triggers on full `msa_initech_redlines.md` text  
- [ ] Law 25 path generates EN+FR PIA when hypo trigger text present  
- [ ] `GAMBIT_DISABLE_CANLII=true` uses fixture verification

---

## Demo beats this task lights up

1:40–2:15 (DEMO_SCRIPT.md)

---

## Fallback plan if behind

- OSFI/PIPEDA: static keyword list + canned messages  
- Law 25: static `pia_template.json` only

---

## Out of scope

- UI panels (T2), Gmail/Slack (T7–T8), payment execution (T9)
