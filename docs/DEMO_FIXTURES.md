# Gambit — Demo Fixtures

Everything needed so the demo arc is **deterministic**. **Authoritative contract text** lives in [`Example Scenario (Optional)/`](../Example%20Scenario%20(Optional)/) — **read-only** (do not edit those `.md` / `.docx` files). Runtime copies or parsed JSON may live under `src/lib/fixtures/` after Sprint 0.

See [SCENARIO_CONTEXT.md](./SCENARIO_CONTEXT.md) for tension maps **R01–R13** (MSA) and **N01–N05** (NDA).

---

## 0. Fixture root constant

```ts
/** Spellbook pack location — read-only source files */
export const FIXTURE_DIR = "Example Scenario (Optional)";
```

---

## 1. Core deal documents (repo paths)

| Key | Path | Description |
|-----|------|-------------|
| `scenario_brief` | `Example Scenario (Optional)/scenario_context.md` | Parties, stakes, tension tables |
| `nda_dunder_original` | `Example Scenario (Optional)/nda_dunder_original.md` (+ `.docx`) | Mutual NDA draft |
| `nda_initech_redlines` | `Example Scenario (Optional)/nda_initech_redlines.md` (+ `.docx`) | One-way + bank-style tightening |
| `msa_dunder_original` | `Example Scenario (Optional)/msa_dunder_original.md` (+ `.docx`) | Vendor-friendly MSA |
| `msa_initech_redlines` | `Example Scenario (Optional)/msa_initech_redlines.md` (+ `.docx`) | **Primary Cockpit pile** — enterprise redlines |

**Redline marker format (parse in UI / T8):**

- `~~strikethrough~~` = Initech deleted  
- `**[INITECH ADD: text]**` = Initech added  
- `*[INITECH COMMENT: ...]*` = internal comment (show as tooltip in demo polish)

Map MSA themes to `RedlineChange.id` **`R01`–`R13`** per SCENARIO_CONTEXT. NDA → **`N01`–`N05`**.

---

## 2. Ghost precedent corpus (synthetic Initech vendor MSAs)

The Spellbook zip does **not** include three historical Initech MSAs. **T4** adds (new files, team-authored):

| Fixture key | Label in UI | Purpose |
|-------------|-------------|---------|
| `precedent_initech_vendor_a` | e.g. “CoreBank Vendor (2022)” | Walkaway: cap / breach carve-out patterns |
| `precedent_initech_vendor_b` | e.g. “Payments API (2023)” | Audit + Ontario data residency |
| `precedent_initech_vendor_c` | e.g. “Cloud Analytics (2024)” | Step-in + insurance minimums |

Place under `Example Scenario (Optional)/precedents/` as **JSON + short clause excerpts** (do not alter Spellbook `.md` contracts).

---

## 3. Game tree pre-staging

| Item | Detail |
|------|--------|
| **Root** | Current position after Initech MSA redlines (focus **§7 Liability** / data /98 audit) |
| **Three branches** | `!!` / `?!` / `??` tuned to **cap + breach carve-out** trade vs “push all enterprise asks” vs “accept full markup” |
| **Scores** | Initial eval **−2.4**; after “Play Best Line” **+0.8** (tunable constants) |
| **Depth** | 2 plies optional; demo can show 1 ply + ghost hover |
| **Fallback** | If LLM fails, UI reads `fixtures/tree_canned.json` |

---

## 4. TrueSight fixture

- **Injected bad citation:** `Beaulieu v. Provincial Insurance, 2021 QCCA 412` (fictional / wrong for demo)  
- **Substitute:** `Bhasin v. Hrynew, 2014 SCC 71` with real CanLII URL  
- Store in `fixtures/truesight_inject.json` for offline stage demo

---

## 5. Multi-regime compliance + PIA

- **OSFI / PIPEDA:** Trigger panels from **insurance mins**, **24h breach notify**, **Ontario-only** data, **audit**, **step-in**, **ISO/SOC** language in `msa_initech_redlines.md`.  
- **Law 25 (demo secondary):** Contrived but **labeled** trigger—e.g. proposed **US-hosted analytics subprocessor** affecting **Quebec** customers or branch data (see DEMO_SCRIPT).  
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
| Currency | **cad** |
| Amount | Demo: **$90,000 CAD** first invoice / installment narrative (e.g. year-one payment chunk)—keep consistent with pitch; commercial anchor **$180K CAD / 24 mo** ≈ **$7,500 CAD/mo** in `Decision.financials` |

---

## 8. Slack / Gmail copy fixtures

- `fixtures/slack_messages.json` — inbound simulation + outbound template  
- `fixtures/gmail_draft.html` — pre-filled body EN/FR variants; **To:** `procurement-legal@initechfg.demo`

---

## 9. Spellbook

- **Preferred:** Real trial API issue list for `msa_initech_redlines.md` text  
- **Fallback:** `fixtures/spellbook_issues.json` aligned to **R01–R13** severity

---

## 10. Hero video

- **URL:** exact string in root [`HeroVideo.MD`](../HeroVideo.MD) — marketing `<video src>` must match **character-for-character** (T1).

---

## Checklist before demo

- [ ] All fixture paths resolve on clean clone  
- [ ] Tree canned JSON loads in &lt; 100ms  
- [ ] Voice file plays on Safari + Chrome  
- [ ] Stripe test key returns 200 (**CAD**)  
- [ ] CanLII check works or TrueSight falls back to canned substitute  
- [ ] Hero video URL matches `HeroVideo.MD`
