# Gambit — Product Overview

**Track:** Spellbook — AI-Assisted Contract Negotiation  
**One-liner:** Stockfish for deals. A negotiation cockpit that models the counterparty (the Ghost), scores moves on a chess-style board, debates recommendations in a War Room, and lets firms rewire the engine via an Architect playbook canvas.

**Live fixture:** Spellbook’s **Dunder AI Inc. vs Initech Financial Group Inc.** pack in [`Example Scenario (Optional)/`](../Example%20Scenario%20(Optional)/). See [SCENARIO_CONTEXT.md](./SCENARIO_CONTEXT.md).

---

## Thesis (one paragraph)

Every transactional negotiation is a game of incomplete information against a counterparty whose moves are not random—they follow patterns from past deals. Senior partners internalize this over decades; founders, AEs, and thin legal benches do not. **Gambit externalizes that intuition:** a counterparty model (**Ghost**) built from the other side’s precedent behavior, a chess-engine-style move evaluator (**Board** / game tree + eval bar), and a cockpit that ties **multi-regime compliance** (OSFI / PIPEDA + optional Law 25 for the bilingual demo beat), drafting, sign-off, and execution into one loop. Two toggles deepen the story: **War Room** (multi-agent debate, auditable) and **Architect** (drag-and-drop workflow + save-as-playbook). The product does not stop at redlines—it aims to close the loop to invoice and ops hooks where the demo requires it.

For this vendor-side scenario, the **existential clauses** are **uncapped breach liability**, **convenience termination**, **IP on custom work**, and **24/7 + audit + step-in**—taken together, they can kill a startup even when each line is “normal” for a bank.

---

## Three modes (structural innovation)

| Mode | Audience | What they see | Demo role |
|------|----------|----------------|-----------|
| **Cockpit** | Closers (Sarah, GCs, founders) | Eval bar, game tree, Ghost card, walkaway line, compliance + execution side panels | Default hero path (~80% of demo) |
| **War Room** | Lawyers under malpractice / audit pressure | Council of agents: short speech bubbles, influence meters, vote tally, Crown synthesis | Toggle 1 — trust & auditability |
| **Architect** | Firm admins, GCs, ops | React-Flow canvas: agents as nodes, edges as data flow, sliders, Save as Playbook | Toggle 2 — platform / firm IP |

**Why three modes:** Cockpit is the product. War Room makes recommendations **defensible** (paper trail). Architect makes Gambit a **platform** (every firm rewires the engine). Spellbook is positioned as the **first node** in the default Architect workflow (issue detection)—we complement, not replace.

---

## Protagonist: Sarah

**Sarah Chen** — **Co-founder & COO**, **Dunder AI Inc.** (Toronto AI contract-review startup). Initech’s procurement/legal team returns a **heavily redlined MSA** (and the deal started with an **NDA** arc). Fractional GC is underwater; the **board / exec hard stop** is tonight. Gambit is built for that moment—deal walks in (inbox/Slack), cockpit activates, **Initech-shaped Ghost** forms, best line is played, sign-off, execution fires.

---

## Feature coverage (nothing cut)

Mapped to the product vision + Spellbook scenario:

- Gmail trigger + outbound draft  
- Slack inbound listen + outbound notification  
- Google Calendar + conflict-aware deadline pressure  
- Counterparty Ghost (RAG + structured extraction over **synthetic Initech precedent** corpus—see SCENARIO_CONTEXT)  
- Chess eval bar + game tree (React-Flow)  
- Walkaway line with cited evidence from “past Initech vendor” posture  
- TrueSight (citation verification vs CanLII; hallucination intercept)  
- **Multi-regime compliance:** OSFI B-13 themes + PIPEDA baseline + **Law 25** secondary beat with auto **PIA** (FR/EN)  
- Bilingual posture (FR/EN across outputs where specified)  
- Real `.docx` counter-redline output (Node `docx` in our stack lock)  
- Supervisor PDF + Legal / Plain-English toggle  
- Voice memo approval (pre-recorded demo path)  
- Execution: Stripe (test, **CAD**), provisioning webhook, Quebec notary queue (narrative)  
- War Room: multi-agent council + optional AI-vs-AI flex (Q&A)  
- Architect: DnD canvas, **OSFI / PIPEDA / Law 25** nodes, tunable agent params, Save as Playbook, playbook library  
- Spellbook integration (API or fixture) at pipeline start  
- SSO mock personas (Sarah / Marc / Initech Procurement)

---

## Differentiation (vs. typical hackathon entries)

Roughly: redline explainer chatbots, clause heatmaps, market comparators, Q&A bots, auto-redline generators, deal dashboards—many demos converge on **annotated PDFs**. Gambit’s shape is different: **Ghost + eval + tree + walkaway evidence + Council + Architect + execution chain**. Judges remember motion and novelty, not another colored box PDF.

---

## Academic anchoring (pitch, one sentence each)

- **Fisher & Ury** — BATNA / ZOPA; eval bar vs walkaway line.  
- **Raiffa** — decision trees under uncertainty; bloom as probability-weighted tree.  
- **Principled negotiation** — interests over positions; Council as structured cabinet.

---

## Stack lock (engineering)

Pure **Next.js 15** (App Router), **Tailwind v4**, **shadcn/ui**, **React-Flow** (game tree + Architect), **Framer Motion** (War Room), **Anthropic Claude** for engine/Ghost/agents, **Node `docx`** + **`@react-pdf/renderer`** for outputs, **NextAuth** + Google APIs (Gmail, Calendar), **Slack** webhooks, **Stripe** test mode, **CanLII** for TrueSight, **Google Cloud Translation** for FR/EN, **Vercel** deploy. Visual tokens: see root `design.MD` (read-only; do not edit).

---

## Demo deal lock

- **Vendor (us):** Dunder AI Inc.  
- **Client (counterparty):** Initech Financial Group Inc.  
- **Contract pack:** `Example Scenario (Optional)/` — NDA + MSA originals and Initech redlines + `scenario_context.md`.  
- **Precedent corpus:** three **team-authored synthetic** “past Initech vendor MSA” profiles (JSON + excerpts) under `Example Scenario (Optional)/precedents/` (T4)—do not edit Spellbook source `.md` files.

---

## Closing line (product)

> Spellbook reviews the contract. Gambit closes the deal—from inbox to invoice, in two languages, with the Council’s record on the file, with sign-off, on the playbook your firm built.

We did not build an assistant. We built an **opponent**, the **war room** around it, and the **OS** underneath it.
