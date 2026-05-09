# T5 — Multi-Agent Council + Architect Runtime

**Owner:** Aditya · **Branch:** `aditya` · **Depends on:** T4 outputs (`GhostProfile`, `CandidateMove`), `Playbook` schema · **Powers demo beats:** War Room stream, AI-vs-AI flex backend, playbook save/load execution

---

## Goal (1 paragraph)

Implement **`CouncilService.deliberate`** as a **multi-agent** Claude pipeline that emits **`DebateEvent`** timeline for UI animation, plus **`CouncilResult`** vote synthesis from **Counsel, Closer, Counterpart, Compliance, Crown**. Implement **`AiVsAiService`** for optional Q&A. Implement **`ArchitectRuntime.execute`** that walks a **`Playbook` DAG** (Spellbook → Ghost → Tree → Compliance → Decision) with block params affecting weights. Implement **`PlaybookRepository`** persistence (filesystem `data/playbooks/*.json` in dev; Vercel KV optional stretch).

---

## Sub-features (exhaustive checklist)

### Agents (prompts)
- [ ] **Counsel:** risk-averse; votes on indemnity, IP, liability, termination, privacy
- [ ] **Closer:** revenue & speed; challenges Counsel trades
- [ ] **Counterpart:** conditioned on Ghost profile; predicts MegaCorp response
- [ ] **Compliance:** wraps T6 `Compliance.check` on proposed snippet (stub hook until T6 lands)
- [ ] **Crown:** aggregates votes; breaks ties; produces `finalRecommendation`

### Council orchestration
- [ ] For each `moveId`, run agents **sequentially or parallel** then Crown
- [ ] Map outputs → `DebateEvent[]` with `t` offsets (e.g. 0, 200, 400ms)
- [ ] Streaming: `ReadableStream` JSON lines or SSE from `POST /api/engine/council`
- [ ] Persist last `CouncilResult` per `dealId+moveId` for audit badge

### AI vs AI
- [ ] `AiVsAiService.runClauseNegotiation`: two ghost-conditioned agents alternate for `maxRounds`
- [ ] Emit `DebateEvent` with agent tags `counterpart_left` / `counterpart_right` (extend type in contracts if needed — **document change**)

### Architect runtime
- [ ] Topological sort of playbook graph; detect cycles → 400 error
- [ ] Node executors registry: `Record<AgentBlockType, ExecutorFn>`
- [ ] Params: sliders map to numeric weights in tree scoring and council vote skew
- [ ] Default playbook fixture: `fixtures/playbook_default.json` matches PDF default workflow

### Persistence API
- [ ] `GET /api/playbooks` list
- [ ] `GET /api/playbooks/:id`
- [ ] `POST /api/playbooks` save
- [ ] Validate with Zod

---

## File / folder layout to create

```
src/lib/engine/council/
  agents.ts
  councilService.ts
  aiVsAi.ts
src/lib/engine/architect/
  runtime.ts
  executors.ts
  repository.ts
app/api/engine/council/route.ts
app/api/engine/aivsai/route.ts
app/api/playbooks/
  route.ts
  [id]/route.ts
```

---

## Public interfaces (typed)

- `CouncilService`, `AiVsAiService`, `ArchitectRuntime`, `PlaybookRepository` from INTEGRATION_CONTRACTS.md

---

## Implementation notes & method choices

- Use **single multi-section Claude call** for speed vs **5 calls** for fidelity — pick one and benchmark; fallback to multi-call if streaming stutters
- Crown must **cite which agent arguments** it followed (string field in `CouncilResult`)
- Architect runtime should be **deterministic** when `GAMBIT_SEED` set

---

## Acceptance criteria

- [ ] Council stream completes for all three moves with non-empty bubbles
- [ ] Saving playbook round-trips; invalid graph rejected
- [ ] Default playbook executes to `Decision` shape (may stub compliance until T6)
- [ ] Contract updates merged to `src/lib/contracts` with team ack

---

## Demo beats this task lights up

2:15–2:30 (War Room), 2:30–2:45 (Architect save), Q&A AI-vs-AI

---

## Fallback plan if behind

- Pre-recorded `council_move_a.json` replay endpoint
- Architect: save-only, no execute path (Decision from static fixture)

---

## Out of scope

- UI layout (T3), OAuth (T7), PDF/docx (T8), Stripe (T9)
