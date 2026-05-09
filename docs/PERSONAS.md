# Gambit — Personas (Mock SSO)

Three pre-staged accounts for demo narrative. **Not real users** — OAuth may be real Google, but these identities are **fixture-backed** for hackathon reliability.

Scenario: **Dunder AI Inc.** (vendor) negotiating **Initech Financial Group Inc.** (client). See [SCENARIO_CONTEXT.md](./SCENARIO_CONTEXT.md).

---

## 1. Sarah Chen — Co-founder & COO (protagonist)

| Field | Value |
|-------|--------|
| **id** | `persona_sarah` |
| **Display name** | Sarah Chen |
| **Email** | `sarah@dunderai.demo` (map to real test inbox in `.env` if using live Gmail) |
| **Role** | `cofounder_coo` (or map to `ae` in code if enum not extended yet) |
| **Org** | Dunder AI Inc. |
| **Job** | Co-founder & Chief Operating Officer |
| **Pain** | First enterprise MSA with a Big-5-style bank; Initech redlines are existential (liability, IP, 24/7, step-in); counsel SLA tight; board/exec hard stop |
| **Demo actions** | Lands on Cockpit; triggers “Play Best Line”; plays voice memo; hits Send on Gmail draft |
| **Branch** | T7 (auth mapping), T1 (chrome switcher) |

---

## 2. Marc Tremblay — Fractional GC / sign-off

| Field | Value |
|-------|--------|
| **id** | `persona_marc` |
| **Display name** | Marc Tremblay |
| **Email** | `marc@dunderai.demo` |
| **Role** | `gc` |
| **Org** | Dunder AI Inc. (fractional) |
| **Job** | General Counsel (outside / fractional) |
| **Demo actions** | Supervisor PDF “Legal mode” reviewer; voice sign-off attributed to GC in copy |
| **Branch** | T7, T8 |

---

## 3. Initech Procurement Counsel — counterparty

| Field | Value |
|-------|--------|
| **id** | `persona_initech` |
| **Display name** | Initech Procurement Counsel |
| **Email** | `procurement-legal@initechfg.demo` |
| **Role** | `counterparty_legal` |
| **Org** | Initech Financial Group Inc. |
| **Job** | Inbound redline sender (procurement / legal) |
| **Demo actions** | From-address on simulated Gmail thread; Slack bot name; Ghost card title **INITECH PROCUREMENT · Regulated FI** |
| **Branch** | T7, T4 |

---

## Optional fourth (narrative only)

| Field | Value |
|-------|--------|
| **CEO / Board** | Used in copy only — “CEO approved” in Slack; no separate login unless you add `persona_ceo` later |

---

## UI: persona switcher

- **Location:** Top bar (T1), dev/demo only or gated by `NODE_ENV`.  
- **Behavior:** Switching persona updates `personaId` on `DealSession` and filters which actions are enabled (e.g. only Sarah runs “Send”; only Marc completes Supervisor sign-off).  
- **Persistence:** `localStorage` key `gambit_persona` for demo stability.

---

## Auth implementation note

- **NextAuth** Google OAuth returns a real `email`. Map `email → personaId` via env `DEMO_EMAIL_SARAH`, etc., or use a **demo bypass** session when `GAMBIT_DEMO_MODE=true` that injects persona without Google.
