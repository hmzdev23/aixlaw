import { describe, expect, it } from "vitest";
import { chunkPrecedent, tokenize } from "../ghost/chunker";

const fakePrecedent = {
  id: "fake_p",
  label: "Fake Precedent (2024)",
  year: 2024,
  vendorType: "demo",
  outcome: "signed" as const,
  summary: "Fake precedent for unit tests.",
  clauses: [
    { ref: "1.1 Liability", topic: "liability_cap", text: "Vendor's aggregate liability shall not exceed CAD $1M except for breach of Section 9." },
    { ref: "9.1 Breach", topic: "breach_notification", text: "Vendor shall notify Client within twenty-four (24) hours of becoming aware of a breach." },
    { ref: "9.3 Audit", topic: "audit", text: "Client may audit twice per calendar year upon forty-eight (48) hours notice." },
  ],
};

describe("chunker", () => {
  it("tokenizes lowercased + punctuation-stripped", () => {
    const t = tokenize("Vendor's aggregate liability shall NOT exceed CAD $1M, except for §9.");
    expect(t).toContain("vendor");
    expect(t).toContain("aggregate");
    expect(t).toContain("liability");
    expect(t).not.toContain("the");
    expect(t).not.toContain("not");
    expect(t.every((tok) => tok === tok.toLowerCase())).toBe(true);
  });

  it("emits one chunk per clause with stable ids and tokens", () => {
    const chunks = chunkPrecedent(fakePrecedent);
    expect(chunks.length).toBe(3);
    expect(chunks[0].id).toBe("fake_p#1-1-liability");
    expect(chunks[1].tokens).toContain("breach");
    expect(chunks[2].clause.ref).toBe("9.3 Audit");
  });
});
