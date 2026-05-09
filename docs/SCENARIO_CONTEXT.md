# Gambit — Scenario Context (Spellbook Fixture)

**Source of truth (read-only in repo):** [`Example Scenario (Optional)/scenario_context.md`](../Example%20Scenario%20(Optional)/scenario_context.md) and companion `.docx` files. **Do not edit** those contract files in the hackathon—consume them as fixtures.

This page is the **engineering summary** so prompts, UI copy, and integration contracts stay aligned with the real pack.

---

## Parties

| Party | Role in demo |
|-------|----------------|
| **Dunder AI Inc.** | **Us (Vendor).** 18-month-old Toronto AI contract-review startup. Sarah Chen = Co-founder & COO. |
| **Initech Financial Group Inc.** | **Counterparty (Client).** Large Canadian financial institution, Toronto HQ, **OSFI** third-party risk posture. |

Both are Ontario corporations. Governing law in the MSA is Ontario + federal Canada.

---

## Deal economics (demo lock)

- **Commercial headline:** **$180K CAD** over the **2-year initial term** (interpreted for demo math as **~$7,500 CAD / month × 24 months**; aligns with execution + Stripe story—clarify in pitch if judges ask about “ARR” wording in the brief).
- **Strategic stakes:** Dunder’s **first enterprise logo**, ~**3×** largest deal to date—**walking away is not a real option**, which raises the drama for the Ghost / walkaway / eval bar.

---

## Document arc

1. **NDA** — Dunder’s mutual draft → Initech redlines to **one-way**, broader confidential-information definition, no bond on injunction, longer survival, FTE-only recipients, audit rights, etc.
2. **MSA** — Dunder’s vendor-friendly draft → Initech **enterprise** redlines (SLA, support, liability carve-outs, IP on custom work, payment / disputes, termination, insurance, indemnity, data location, audits, step-in).

**Cockpit primary surface:** `msa_initech_redlines.md` (densest negotiation). NDA can be toggled in inbound fixture (`documentType`: `nda` | `msa`).

---

## MSA tension map (13 themes → redline IDs `R01`–`R13`)

| ID | Theme | Dunder position | Initech position |
|----|--------|-----------------|------------------|
| R01 | Uptime SLA | 99.5%, 48h maintenance notice | 99.9%, 10 business days notice, no maintenance in business hours |
| R02 | Support | Business hours | 24/7/365 + tiered response SLAs |
| R03 | Liability cap | 12 months fees, all claims | Cap **does not apply** to data-breach / §9 claims → **uncapped** there |
| R04 | Consequential damages | Broad mutual exclusion | Carve-outs for data breach / gross negligence |
| R05 | IP / custom work | Vendor retains all including custom | Client owns custom funded by Client |
| R06 | Feedback | Vendor free to use | Cannot use for other clients without consent |
| R07 | Payment | Net 30, 18% interest | Net 60, 6%; may **withhold full invoice** in dispute; no suspension during dispute |
| R08 | Fee increases | Up to 5% / 60d notice renewal | Up to 3% / 90d notice |
| R09 | Termination | Cause + 30d cure | **15d** cure; **Client convenience** termination 30d |
| R10 | Audit rights | None in base draft | 2×/year, 48h notice (added in §9.3) |
| R11 | Data location | Canada | **Ontario only**; no cross-border without consent |
| R12 | Insurance | Not specified | $5M CGL, $5M E&O, **$10M cyber** |
| R13 | Step-in | Not in draft | Client may assume services if vendor fails |

---

## NDA tension map (5 themes → `N01`–`N05`)

| ID | Theme | Dunder | Initech |
|----|--------|--------|---------|
| N01 | Mutuality | Mutual NDA | **One-way** (Vendor only as recipient) |
| N02 | Definition scope | Reasonable-person confidential | **Everything** including unmarked / verbal |
| N03 | Injunctive relief | Bond required | **No bond** for Initech |
| N04 | Term | 2y + 2y survival | **3y** + **5y** survival; asymmetric termination |
| N05 | Return / destruction | Archival copy allowed | **No archival** without consent; certification |

---

## Why this is hard for Dunder (pitch line)

Initech’s asks are **individually defensible** for a regulated bank; **in aggregate** they shift existential risk onto a startup: **uncapped breach exposure**, **convenience termination**, **IP loss on custom work**, **24/7 ops**, **audit + step-in**. Gambit’s job is to show **which fights matter**, **what to concede**, and **what “best line”** looks like under time pressure—not just summarize redlines.

---

## Compliance posture for Gambit (multi-regime)

- **Primary (authentic to scenario):** **OSFI Guideline B-13**-style third-party / operational resilience themes (vendor risk, audits, breach timelines, resilience) + **PIPEDA** / Canadian privacy baseline.
- **Secondary (hackathon / FR judges):** **Law 25** + bilingual **PIA** when demo narrative includes **US-hosted subprocessors** affecting **Quebec-resident or Quebec-branch** data (explicitly flag as a **contrived but labeled** trigger in demo script—see [DEMO_SCRIPT.md](./DEMO_SCRIPT.md)).

---

## Fixture file paths (relative to repo root)

| Asset | Path |
|-------|------|
| Scenario brief | `Example Scenario (Optional)/scenario_context.md` |
| NDA clean | `Example Scenario (Optional)/nda_dunder_original.md` |
| NDA redlined | `Example Scenario (Optional)/nda_initech_redlines.md` |
| MSA clean | `Example Scenario (Optional)/msa_dunder_original.md` |
| MSA redlined | `Example Scenario (Optional)/msa_initech_redlines.md` |
| Hero video URL | Root [`HeroVideo.MD`](../HeroVideo.MD) (single allowed `src` for `<video>`) |
| Stretch SPA | `NVCA-Model-SPA-10-28-2025-1.docx.pdf` |

---

## Ghost / precedent corpus (implementation)

The Spellbook pack does **not** include three past Initech vendor MSAs. **Aditya (T4)** adds **synthetic precedent JSON + short clause excerpts** under `Example Scenario (Optional)/precedents/` (new, team-authored) for RAG—**do not modify** the Spellbook `.md` contracts when doing so.
