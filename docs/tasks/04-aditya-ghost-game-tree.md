# T4 — Counterparty Ghost + Game Tree Engine

**Owner:** Aditya · **Branch:** `aditya` · **Depends on:** Fixtures (`DealSession`, 3 precedents, redlines), `SpellbookIssue[]` optional from T9 · **Powers demo beats:** Ghost card, bloom, hover counter-responses, walkaway citations, eval scores

---

## Goal (1 paragraph)

Implement **`GhostEngine`** and **`TreeEngine`** (+ **`EvalService`**, **`WalkawayService`**) as server-side modules and HTTP/route handlers. **Ghost** = RAG + structured extraction over three MegaCorp precedent MSAs producing `GhostProfile`. **Tree** = Raiffa-style **three candidate moves** with chess notation, close probabilities, retained value, and **ghost reply previews** on hover. **Walkaway** = threshold summary + three **evidence-backed** citations pulled from precedent text (quotes + clause refs). Use **Claude** with **tool use / JSON schema**; always merge with **canned fallback** from `fixtures/tree_canned.json` when model or latency fails.

---

## Sub-features (exhaustive checklist)

### Ingestion & RAG
- [ ] Chunk precedent docs (e.g. 512–1k tokens, clause-aware splits on headings)
- [ ] Embedding store: **in-memory** `Map` for hackathon OR `sqlite-vss` if time
- [ ] Retrieve top-k chunks for queries: “MegaCorp liability cap”, “audit rights”, “termination”
- [ ] `GhostEngine.generate(session)` pipeline: retrieve → synthesize profile → validate JSON against Zod schema

### Ghost profile
- [ ] Deterministic `counterpartyId: megacorp`
- [ ] `elo`: composite function of extracted stubbornness signals (document formula in code comments)
- [ ] `fightsOn`, `oftenConcedes`, `walksWhen`: **lists ≥ 3 items** where possible
- [ ] `refreshFromIssues(session, issues)` bumps emphasis from Spellbook severities

### Game tree
- [ ] `TreeEngine.bloom` returns `GameTree` with **exactly three** `primaryBranchIds`
- [ ] Notation assignment: map model labels to `!!`, `?!`, `??` per demo script
- [ ] Numeric: `closeProbability` monotonic with risk story; `retainedValueUsd` optional from commercial fixture
- [ ] `predictCounterMove(nodeId)` uses node context + Ghost chunks
- [ ] Pre-staged depth: at minimum root → 3 children; optional 2-ply for Q&A

### Eval service
- [ ] `scorePosition` maps narrative advantage to float in **−4..+4** then **normalize** to demo constants (−2.4 start, +0.8 best line)
- [ ] Expose intermediate “pawn units” for UI if needed

### Walkaway
- [ ] `WalkawayService.getLine` returns **≥3** `WalkawayCitation`s with real substring quotes from precedents
- [ ] If model quotes fail validation, fall back to longest clause match from source text

### API routes
- [ ] `POST /api/engine/ghost` body: `{ dealId }` → `GhostProfile`
- [ ] `POST /api/engine/tree` body: `{ dealId, ghostVersion? }` → `GameTree`
- [ ] `GET /api/engine/counter?id&nodeId` → `{ text }`
- [ ] `GET /api/engine/walkaway?dealId` → `WalkawayLine`
- [ ] `POST /api/engine/eval` body: `{ dealId, nodeId }` → `{ score }`

### Safety
- [ ] Strip PII; only fictional parties
- [ ] Log prompts **off** in production; on for dev with redaction

---

## File / folder layout to create

```
src/lib/engine/ghost/
  chunker.ts
  retrieve.ts
  ghostEngine.ts
src/lib/engine/tree/
  treeEngine.ts
  evalService.ts
  walkawayService.ts
  prompts/
    ghost.system.md
    tree.user.md
app/api/engine/
  ghost/route.ts
  tree/route.ts
  counter/route.ts
  walkaway/route.ts
  eval/route.ts
```

---

## Public interfaces (typed)

Implement exactly:

- `GhostEngine` from INTEGRATION_CONTRACTS.md
- `TreeEngine`, `EvalService`, `WalkawayService`

---

## Implementation notes & method choices

- **Claude model:** Sonnet for quality; Haiku for hover previews if cost/latency tight
- **Structured outputs:** Zod parse + single retry with “fix JSON” system message
- **Caching:** `Map<dealId, GhostProfile>` TTL 1h in dev
- **Spellbook:** consume `SpellbookIssue[]` as **features**, not ground truth law

---

## Acceptance criteria

- [ ] Ghost API returns in &lt; 3s on warm cache; &lt; 10s cold with fixtures
- [ ] Tree always returns 3 branches with valid notation enum
- [ ] Walkaway quotes are **substring-verified** against at least one precedent file
- [ ] Fixture fallback path tested with `GAMBIT_DISABLE_LLM=true`

---

## Demo beats this task lights up

0:35–1:40, 2:45–2:55 (DEMO_SCRIPT.md)

---

## Fallback plan if behind

- Static `ghost.json` + `tree_canned.json` only; APIs read files
- Drop 2-ply tree; hover returns canned strings

---

## Out of scope

- JSX, Gmail, Stripe, PDF, Council orchestration (T5), CanLII (T6)
