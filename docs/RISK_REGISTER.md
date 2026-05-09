# Gambit — Risk Register

Derived from `ai law e2e (non tech).pdf` Section 14 plus scenario-specific risks. Owners are **default** — adjust in standup.

| ID | Risk | Mitigation | Owner |
|----|------|------------|-------|
| R1 | Three modes in 3:30 is ambitious | Cockpit beats 5–10s; toggles 15–20s flash only; rehearse; compress Stripe/Notary if needed | Hamza (pacing), all (rehearsal) |
| R2 | Ghost card feels gimmicky / thin | Invest in typography, real stats, precedent count, clause count; animate roster-style entrance | Aditya (content), Hamza (motion) |
| R3 | Architect canvas slow to ship | React-Flow OOTB; pre-load default workflow; treat as hour 7–8 gate in build | Hamza, Aditya |
| R4 | War Room looks childish | Linear/Vercel-style monochrome icons, accent rings; short bubbles not paragraphs | Hamza |
| R5 | Judge asks “is the Ghost real?” | RAG + extraction on **3 synthetic Initech vendor** precedent JSON; Q&A add a 4th excerpt live | Aditya |
| R6 | Spellbook sponsors feel competed-with | We now ship **their** Dunder/Initech pack in-repo; Spellbook = **first Architect node**; pitch credits by name; issue detection before engine | Will (integration copy), Aditya (graph default) |
| R7 | Law 25 trigger feels contrived for two Ontario companies | Label beat explicitly as **hypo extension** (US subprocessor + Quebec-impacted data); primary compliance = **OSFI + PIPEDA** | Aditya (T6 copy), all (pitch) |
| R8 | OSFI B-13 / guideline specifics may not match live regulation | Disclaim in UI footer / PIA watermark; cite “OSFI third-party risk themes” not a legal opinion; use scenario language from Initech redlines | Aditya, Marc persona review |

---

## Additional engineering risks

| ID | Risk | Mitigation | Owner |
|----|------|------------|-------|
| E1 | Gmail OAuth flaky on venue Wi‑Fi | `manual_demo` inbound + cached thread | Will |
| E2 | CanLII rate limits / HTML change | Cache + fixture substitution path | Aditya |
| E3 | LLM latency breaks demo | Canned tree + stream only War Room | Aditya |
| E4 | Merge conflicts on `contracts/` | Single PR owner for `src/lib/contracts`; see BRANCHING_AND_GIT | All |

---

## Status

All risks **Open** until first full dry run; then mark **Mitigated** or **Accepted** with date.
