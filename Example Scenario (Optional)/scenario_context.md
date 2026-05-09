# Hackathon Scenario Context
**Dunder AI Inc. & Initech Financial Group Inc.**

*This file provides background for the hackathon challenge. It is not part of any contract.*

---

## The Companies

**Dunder AI Inc.** is an 18-month-old Toronto startup with an AI-powered contract review platform. They have a handful of mid-market clients but no enterprise logos yet. They are founder-led, lightly capitalized, and their legal documents are drafted to minimize exposure — low liability caps, IP firmly retained, no audit rights, auto-renewal built in.

**Initech Financial Group Inc.** is a large Canadian financial institution headquartered in Toronto. They are subject to OSFI (Office of the Superintendent of Financial Institutions) oversight, which imposes strict third-party risk management requirements on any vendor handling their data. Their legal team is experienced, well-resourced, and accustomed to dictating terms to vendors.

---

## The Deal

Initech has been evaluating Dunder AI's platform for 6 weeks. It passed Initech's security review. The commercial teams have agreed on pricing: **$180K CAD ARR** for a 2-year initial term. This would be Dunder AI's first enterprise logo and their largest deal by 3x — material enough that walking away is not a real option.

The deal started with an NDA (as it always does) and has now progressed to an MSA. Both documents have been redlined by Initech's legal team.

---

## The Files

| File | What it is |
|---|---|
| `nda_dunder_original.md` | Dunder AI's proposed NDA — mutual, balanced |
| `nda_initech_redlines.md` | Initech's redlined NDA — converted to one-way, broader scope |
| `msa_dunder_original.md` | Dunder AI's proposed MSA — founder-friendly |
| `msa_initech_redlines.md` | Initech's redlined MSA — enterprise-heavy, several existential asks |

---

## Key Tensions

### NDA
| Issue | Dunder AI position | Initech position |
|---|---|---|
| Mutuality | Mutual — both parties share confidential info | One-way — only Initech is a disclosing party |
| Definition scope | Information that "reasonably should be understood" as confidential | Everything, regardless of marking, including verbal disclosures |
| Injunctive relief | Disclosing party must post bond | No bond required for Initech |
| Term | 2 years + 2 year survival | 3 years + 5 year survival |
| Termination | Either party on 30 days notice | Initech at will; Dunder AI on 90 days notice |

### MSA
| Issue | Dunder AI position | Initech position |
|---|---|---|
| Uptime SLA | 99.5%, maintenance on 48h notice | 99.9%, maintenance outside business hours, 10 business days notice |
| Support | Business hours only | 24/7/365 with hourly SLAs |
| Liability cap | 12 months of fees, all claims | 12 months for commercial disputes; **uncapped for data breaches** |
| Consequential damages | Fully excluded | Exclusion does not apply to data breach or gross negligence |
| IP ownership | Vendor retains everything, including custom builds | Client owns anything custom-built and funded by Client |
| Feedback | Vendor can use freely | Vendor cannot use to build features for other clients |
| Payment terms | Net 30, 18% annual interest on late payments | Net 60, 6% annual interest; Client may withhold full invoice in dispute |
| Fee increases | Up to 5% on renewal, 60 days notice | Up to 3% on renewal, 90 days notice |
| Termination | Cause only, 30-day cure period | Convenience termination for Client on 30 days; 15-day cure period |
| Audit rights | None | Twice per year, 48 hours notice |
| Data location | Canada | Ontario only |
| Insurance | Not specified | $10M cyber liability, $5M E&O, $5M CGL |
| Step-in rights | Not included | Client may assume control of Services if Vendor fails to perform |

---

## What Makes This Hard for Dunder AI

Most of Initech's asks are individually justifiable — they are a regulated financial institution with real compliance obligations. But taken together, they shift virtually all commercial and operational risk onto a startup that:

- Cannot afford to be uncapped on data breach liability
- Has no 24/7 support infrastructure
- Cannot give away IP ownership of custom development without gutting their roadmap
- Cannot survive a convenience termination clause that lets Initech walk at any time penalty-free

The interesting negotiation question is not "which party is right" — it's **which issues are worth fighting for, which can be conceded, and how to frame each position in a way that keeps the deal alive.**

---

## Notes for Participants

- The redline format uses `~~strikethrough~~` for deletions and `**[INITECH ADD: text]**` for additions.
- Initech's internal comments are marked `*[INITECH COMMENT: ...]*` — these are visible to participants to simulate having context on the other side's reasoning.
- The contracts are realistic but simplified for readability. Some standard boilerplate (schedules, order form templates) has been omitted.
- Spellbook trial access is available at [link to be added] — you can use it to explore what a production contract review tool looks like, or build on top of it.
