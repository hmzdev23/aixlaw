# Runtime fixtures

Parsed JSON / canned data consumed by the app at runtime. **Not** a copy of the
read-only Spellbook pack at `Example Scenario (Optional)/`.

| File | Owner | Used by |
|------|-------|---------|
| `personas.json` | Will (T7) | NextAuth persona resolver, `/api/personas` |
| `tree_canned.json` *(future)* | Aditya (T4) | Cockpit fallback when LLM unavailable |
| `truesight_inject.json` *(future)* | Aditya (T6) | TrueSight demo substitution |
| `pia_template.json` *(future)* | Aditya (T6) | Law 25 PIA scaffolding |
| `spellbook_issues.json` *(future)* | Will (T9) | Spellbook fallback aligned to R01–R13 / N01–N05 |
| `slack_messages.json` *(future)* | Will (T7/T8) | Inbound simulation + outbound templates |
| `gmail_draft.html` *(future)* | Will (T8) | EN/FR draft body template |

Do **not** store secrets here. Anything resembling a credential goes in
`.env.local`.
