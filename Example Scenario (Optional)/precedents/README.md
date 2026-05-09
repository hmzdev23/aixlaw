# Synthetic Initech Vendor Precedents

> **Authored by Gambit team (T4 / Aditya). Synthetic — not real Initech contracts.**
> Used as the RAG corpus for the Counterparty Ghost so the engine has *substantive* clause text
> to extract patterns from (fightsOn / oftenConcedes / walksWhen / walkaway citations).
>
> Spellbook source materials in this directory are read-only fixtures. These JSON files were
> added by Gambit; do not modify the Spellbook `.md` / `.docx` files.

Each file shape:

```jsonc
{
  "id": "initech_vendor_<x>",
  "label": "Vendor (Year)",          // shown in UI / walkaway citations
  "year": 2023,
  "vendorType": "fintech api",        // narrative flavor
  "outcome": "signed" | "walked",
  "clauses": [
    {
      "ref": "7.1 Limitation of Liability",
      "topic": "liability_cap",        // matches RetrievalQuery topic for scoring
      "text": "...verbatim clause..."  // walkaway citations must substring-match this
    }
  ]
}
```

Topic tags drive the lexical retriever; clause text quotes are required to be
substring-verifiable for `WalkawayService` to accept them as evidence.
