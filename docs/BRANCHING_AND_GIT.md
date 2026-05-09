# Gambit — Branching & Git

## Branch model

| Branch | Owner | Tasks |
|--------|-------|-------|
| `main` | Integration lead | Sprint 0 scaffold, contracts, CI, releases |
| `hamza` | Hamza | T1, T2, T3 |
| `aditya` | Aditya | T4, T5, T6 |
| `will` | Will | T7, T8, T9 |

**Rule:** Feature work happens on **owner branches**. Merge to `main` via PR after review. No long-lived shared branches except `main`.

---

## Sprint 0 on `main` (before heavy feature coding)

1. `create-next-app` + Tailwind + shadcn init  
2. Copy `docs/INTEGRATION_CONTRACTS.md` + `docs/DATA_MODELS.md` → `src/lib/contracts/`  
3. `src/lib/fixtures/README.md` + empty JSON placeholders  
4. `.env.example` with all keys from ARCHITECTURE.md  
5. ESLint + Prettier (optional)

Everyone **rebases** their feature branch onto latest `main` after Sprint 0.

---

## Integration cadence

- **Daily (or every 4h in hackathon):** `git fetch && git rebase origin/main` on your branch.  
- **Contract changes:** Only with **all three** ack in Slack/thread; update `docs/INTEGRATION_CONTRACTS.md` in same PR as `src/lib/contracts`.  
- **Big UI dependency:** If Hamza needs a new field on `GameTree`, open a tiny PR to `main` contracts first.

---

## Do-not-touch zones

| Path / file | Rule |
|-------------|------|
| `design.MD` | **Read-only** — never edit |
| `src/lib/contracts/*` | Consensus-only; small focused PRs |
| `docs/INTEGRATION_CONTRACTS.md` | Must match code after any API change |

---

## Merge conflict playbook

1. Prefer **incoming `main` contracts** if you didn’t touch them.  
2. For UI: resolve layout in `hamza` branch, then merge.  
3. For engine: Aditya wins logic conflicts in `src/lib/engine`; Hamza wins `components/`.  
4. Never resolve by deleting env vars from `.env.example`.

---

## Commit message convention

```
[T1] feat(ui): add mode tabs shell
[T7] feat(integrations): gmail inbound stub
[T4] feat(engine): ghost generate API
```

---

## Remote

- Push when ready; Vercel preview per branch optional.  
- **Do not** force-push `main` without team sync.

---

## After hackathon

- Tag `demo-2026-05-09` (or event date) on commit that was presented.  
- Archive playbooks under `fixtures/playbooks/`.
