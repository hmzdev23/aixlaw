# Gambit — Task Assignments

Master table for the 9-task breakdown. **Status** starts at `Planned`; update during execution.

| ID | Title | Owner | Branch | Depends on (soft) | Demo beats (see DEMO_SCRIPT.md) | Status |
|----|-------|-------|--------|-------------------|----------------------------------|--------|
| **T1** | Foundation & Marketing Shell | Hamza | `hamza` | — | Cold open shell, mode tabs, FR/EN chrome | Planned |
| **T2** | Cockpit UI | Hamza | `hamza` | T1 shell, contracts for tree data | Pile, eval, calendar, Ghost, bloom, walkaway, TrueSight UI, Law25 panel, Play Best Line UI, docx/pdf panes, voice, timeline | Planned |
| **T3** | War Room + Architect UI | Hamza | `hamza` | T1, Council/Playbook event types | Toggle War Room, Toggle Architect, optional AI-vs-AI view | Planned |
| **T4** | Ghost + Game Tree Engine | Aditya | `aditya` | Fixtures (T7), Spellbook feed (T9 contract) | Ghost card, bloom, hover responses, walkaway citations | Planned |
| **T5** | Multi-Agent Council + Architect Runtime | Aditya | `aditya` | T4 outputs, Playbook schema | War Room votes, AI-vs-AI backend, playbook execute | Planned |
| **T6** | TrueSight + Law 25 + Bilingual | Aditya | `aditya` | T4/T5 text surfaces | TrueSight intercept, PIA FR/EN, i18n content | Planned |
| **T7** | Inbound Triggers + Auth + Personas | Will | `will` | — | Gmail/Slack trigger, calendar deadline, personas | Planned |
| **T8** | Outbound Work Product + Voice | Will | `will` | T4 `Decision` shape | docx, Supervisor PDF, voice sign-off, Gmail draft, Slack approval | Planned |
| **T9** | Execution Engine + Spellbook + Notary | Will | `will` | T8 handoff | Stripe, provisioning, notary queue, timeline, Spellbook client | Planned |

## Ownership rules

- **Hamza:** No Claude prompts, no webhook secrets, no Stripe. UI + React-Flow + motion only.  
- **Aditya:** No JSX except maybe Story-less test harness; engine + prompts + compliance.  
- **Will:** No game-tree math; integrations + file bytes + execution.

## Merge order (suggested)

1. `main` Sprint 0: `src/lib/contracts`, minimal app shell.  
2. `will` → inbound + env wiring (T7) so others can mock.  
3. `aditya` → engine APIs returning fixture-shaped JSON.  
4. `hamza` → UI wired to APIs.  
5. Integrate T8/T9 and polish.

Soft dependencies mean: you can stub with `fixtures/` until the owner lands.
