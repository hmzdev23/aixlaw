# Gambit — Personas (Mock SSO)

Three pre-staged accounts for demo narrative. **Not real users** — OAuth may be real Google, but these identities are **fixture-backed** for hackathon reliability.

---

## 1. Sarah Chen — AE (protagonist)

| Field | Value |
|-------|--------|
| **id** | `persona_sarah` |
| **Display name** | Sarah Chen |
| **Email** | `sarah.chen@acmeanalytics.demo` (map to real test inbox in `.env` if using live Gmail) |
| **Role** | `ae` |
| **Org** | Acme Analytics |
| **Job** | Account Executive, Series B SaaS |
| **Pain** | Quarter-end signature blocked by 12 redlines; counsel SLA 48h; board meeting hard stop |
| **Demo actions** | Lands on Cockpit; triggers “Play Best Line”; plays voice memo; hits Send on Gmail draft |
| **Branch** | T7 (auth mapping), T1 (chrome switcher) |

---

## 2. Marc Tremblay — GC / sign-off

| Field | Value |
|-------|--------|
| **id** | `persona_marc` |
| **Display name** | Marc Tremblay |
| **Email** | `marc.tremblay@acmeanalytics.demo` |
| **Role** | `gc` |
| **Org** | Acme Analytics |
| **Job** | General Counsel |
| **Demo actions** | Supervisor PDF “Legal mode” reviewer; optional e-sign checkbox; voice sign-off attributed to GC in copy |
| **Branch** | T7, T8 |

---

## 3. MegaCorp Legal — counterparty

| Field | Value |
|-------|--------|
| **id** | `persona_megacorp` |
| **Display name** | MegaCorp Legal |
| **Email** | `legal@megacorpcloud.demo` |
| **Role** | `counterparty_legal` |
| **Org** | MegaCorp Cloud Services Inc. |
| **Job** | Inbound redline sender |
| **Demo actions** | From-address on simulated Gmail thread; Slack bot name; Ghost card title **MEGACORP LEGAL** |
| **Branch** | T7, T4 |

---

## Optional fourth (narrative only)

| Field | Value |
|-------|--------|
| **CEO** | Used in copy only — “CEO approved” in Slack; no separate login required unless you add `persona_ceo` later |

---

## UI: persona switcher

- **Location:** Top bar (T1), dev/demo only or gated by `NODE_ENV`.  
- **Behavior:** Switching persona updates `personaId` on `DealSession` and filters which actions are enabled (e.g. only Sarah runs “Send”; only Marc completes Supervisor sign-off).  
- **Persistence:** `localStorage` key `gambit_persona` for demo stability.

---

## Auth implementation note

- **NextAuth** Google OAuth returns a real `email`. Map `email → personaId` via env `DEMO_EMAIL_SARAH`, etc., or use a **demo bypass** session when `GAMBIT_DEMO_MODE=true` that injects persona without Google.
