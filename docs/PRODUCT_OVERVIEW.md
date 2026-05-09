# Gambit — Product Overview

**Track:** Spellbook — AI-Assisted Contract Negotiation  
**One-liner:** Stockfish for deals. A negotiation cockpit that models the counterparty (the Ghost), scores moves on a chess-style board, debates recommendations in a War Room, and lets firms rewire the engine via an Architect playbook canvas.

---

## Thesis (one paragraph)

Every transactional negotiation is a game of incomplete information against a counterparty whose moves are not random—they follow patterns from past deals. Senior partners internalize this over decades; juniors, AEs, founders, and many in-house GCs do not. **Gambit externalizes that intuition:** a counterparty model (**Ghost**) built from the other side’s precedent contracts, a chess-engine-style move evaluator (**Board** / game tree + eval bar), and a cockpit that ties compliance, drafting, sign-off, and execution into one loop. Two toggles deepen the story: **War Room** (multi-agent debate, auditable) and **Architect** (drag-and-drop workflow + save-as-playbook). The product does not stop at redlines—it aims to close the loop to invoice and ops hooks where the demo requires it.

---

## Three modes (structural innovation)

| Mode | Audience | What they see | Demo role |
|------|----------|----------------|-----------|
| **Cockpit** | Closers (Sarah, in-house GCs, AEs, founders) | Eval bar, game tree, Ghost card, walkaway line, compliance + execution side panels | Default hero path (~80% of demo) |
| **War Room** | Lawyers under malpractice / audit pressure | Council of agents: short speech bubbles, influence meters, vote tally, Crown synthesis | Toggle 1 — trust & auditability |
| **Architect** | Firm admins, GCs, ops | React-Flow canvas: agents as nodes, edges as data flow, sliders, Save as Playbook | Toggle 2 — platform / firm IP |

**Why three modes:** Cockpit is the product. War Room makes recommendations **defensible** (paper trail). Architect makes Gambit a **platform** (every firm rewires the engine). Spellbook is positioned as the **first node** in the default Architect workflow (issue detection)—we complement, not replace.

---

## Protagonist: Sarah

**Sarah Chen** — AE at **Acme Analytics** (Series B SaaS). End of quarter: she needs a signature on a **SaaS MSA** from **MegaCorp Cloud Services Inc.** Legal returns **twelve redlines**; her counsel needs 48 hours; the board meeting is at 6 PM. Gambit is built for that moment—deal walks in (inbox/Slack), cockpit activates, Ghost forms, best line is played, CEO signs off, execution fires.

---

## Feature coverage (nothing cut)

Mapped to the non-technical spec (`ai law e2e (non tech).pdf` Section 8):

- Gmail trigger + outbound draft  
- Slack inbound listen + outbound notification  
- Google Calendar + conflict-aware deadline pressure  
- Counterparty Ghost (RAG + structured extraction over precedent MSAs)  
- Chess eval bar + game tree (React-Flow)  
- Walkaway line with cited evidence from past deals  
- TrueSight (citation verification vs CanLII; hallucination intercept)  
- Law 25 trapdoor + auto PIA (FR/EN)  
- Bilingual posture (FR/EN across outputs where specified)  
- Real `.docx` counter-redline output (Node `docx` in our stack lock)  
- Supervisor PDF + Legal / Plain-English toggle  
- Voice memo approval (pre-recorded demo path)  
- Execution: Stripe (test), provisioning webhook, Quebec notary queue  
- War Room: multi-agent council + optional AI-vs-AI flex (Q&A)  
- Architect: DnD canvas, tunable agent params, Save as Playbook, playbook library  
- Spellbook integration (API or fixture) at pipeline start  
- SSO mock personas (Sarah, GC, MegaCorp Legal)

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

- **Counterparty:** MegaCorp Cloud Services Inc. (fictional).  
- **Buyer / Sarah’s company:** Acme Analytics.  
- **Contract pack:** Spellbook fictional MSA + redlined version + scenario brief (when available in repo/fixtures).  
- **Precedent corpus:** three fictional MegaCorp MSAs for Ghost RAG (defensible “past deal” narrative).

---

## Closing line (product)

> Spellbook reviews the contract. Gambit closes the deal—from inbox to invoice, in two languages, with the Council’s record on the file, with the CEO’s sign-off, on the playbook your firm built.

We did not build an assistant. We built an **opponent**, the **war room** around it, and the **OS** underneath it.
