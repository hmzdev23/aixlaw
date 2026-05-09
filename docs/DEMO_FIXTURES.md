# Gambit — Demo Fixtures

Everything needed so the demo arc is **deterministic**. Store under `src/lib/fixtures/` after Sprint 0.

---

## 1. Core deal documents

| Fixture key | Description | Owner |
|-------------|-------------|-------|
| `msa_megacorp_acme_base` | Clean baseline SaaS MSA (Spellbook fictional MSA when available) | Will / team |
| `msa_megacorp_acme_redlined` | Version with **12** track-changes / redline items | Will |
| `scenario_brief` | JSON: parties, commercial terms, tension points | Will |

**12 redlines (conceptual buckets — align to Spellbook pack):**

1. Limitation of liability — cap amount / carve-outs  
2. Indemnity — IP vs general scope  
3. Confidentiality — residual vs strict  
4. Data processing — subprocessors, transfers, geolocation  
5. Audit rights — frequency / scope  
6. SLA / remedies — credits vs termination  
7. Termination — convenience notice  
8. Payment — Net 30 vs Net 60  
9. Auto-renew / price increase  
10. Insurance certificates  
11. Assignment / change of control  
12. Governing law / venue (if not Quebec-focused, keep neutral)

Each maps to a `RedlineChange` id `R01`–`R12` in `DATA_MODELS.md`.

---

## 2. Ghost precedent corpus (3 × MegaCorp MSAs)

| Fixture key | Label in UI | Purpose |
|-------------|-------------|---------|
| `precedent_megacorp_2021` | e.g. “VendorCo (2021)” | Walkaway: cap vs revenue multiple |
| `precedent_megacorp_2022` | e.g. “DataHub (2022)” | Audit / data residency fights |
| `precedent_megacorp_2023` | “Acme-like” reference | Aligns with walkaway copy in PDF |

Each file: full text or chunked JSON for RAG. Include **at least one** clause snippet that supports walkaway narrative (e.g. walked when cap &lt; threshold).

---

## 3. Game tree pre-staging

| Item | Detail |
|------|--------|
| **Root** | Current position after their 12 redlines |
| **Three branches** | `!!` / `?!` / `??` with fixed labels matching PDF (Net 60 + cap $5M, push all twelve, accept full markup) |
| **Scores** | Initial eval **−2.4**; after “Play Best Line” **+0.8** (tunable constants) |
| **Depth** | 2 plies optional; demo can show 1 ply + ghost hover |
| **Fallback** | If LLM fails, UI reads `fixtures/tree_canned.json` |

---

## 4. TrueSight fixture

- **Injected bad citation:** `Beaulieu v. Provincial Insurance, 2021 QCCA 412` (fictional / wrong for demo)  
- **Substitute:** `Bhasin v. Hrynew, 2014 SCC 71` with real CanLII URL  
- Store in `fixtures/truesight_inject.json` for offline stage demo

---

## 5. Law 25 + PIA

- **Trigger snippet:** contract language mentioning tracking tech, IP geolocation, US subprocessors (from redline #4)  
- **PIA sections:** categories of data, retention, transfers, lawful basis — **EN + FR** JSON; Translation API can refine FR at runtime  
- File: `fixtures/pia_template.json`

---

## 6. Voice memo

| Field | Value |
|-------|--------|
| Path | `public/demo/sarah-send-it.m4a` (or `.mp3`) |
| Duration | &lt; 5s |
| Transcript | “Looks good. Send it.” |
| Implementation | HTML5 `<audio>`; sign-off button enables after `ended` event (T8) |

---

## 7. Stripe (test)

| Item | Value |
|------|--------|
| Mode | Test |
| Card | `4242 4242 4242 4242` |
| Amount | Derived from Decision financials — e.g. $9,500/mo × 12 = invoice line items (T9) |

---

## 8. Slack / Gmail copy fixtures

- `fixtures/slack_messages.json` — inbound simulation + outbound template  
- `fixtures/gmail_draft.html` — pre-filled body EN/FR variants

---

## 9. Spellbook

- **Preferred:** Real trial API issue list for the MSA text  
- **Fallback:** `fixtures/spellbook_issues.json` matching 12 redlines severity

---

## Checklist before demo

- [ ] All fixture keys resolvable in dev  
- [ ] Tree canned JSON loads in &lt; 100ms  
- [ ] Voice file plays on Safari + Chrome  
- [ ] Stripe test key returns 200  
- [ ] CanLII check works or TrueSight falls back to canned substitute
