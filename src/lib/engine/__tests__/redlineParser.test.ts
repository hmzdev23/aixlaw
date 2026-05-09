import { describe, expect, it } from "vitest";
import {
  countChanges,
  parseRedlinedDoc,
} from "../_shared/redlineParser";

describe("redlineParser", () => {
  const sample = `Vendor will use commercially reasonable efforts to ensure the Services are available ~~99.5%~~ **[INITECH ADD: 99.9%]** of the time, with maintenance notice of ~~48 hours~~ **[INITECH ADD: ten (10) business days]**.

*[INITECH COMMENT: 99.5% equates to 3.6 hours of downtime per month.]*`;

  it("extracts deletions, additions, and comments", () => {
    const parsed = parseRedlinedDoc(sample);
    const kinds = parsed.segments.map((s) => s.kind).sort();
    expect(kinds).toEqual(["addition", "addition", "comment", "deletion", "deletion"]);
  });

  it("produces a cleanedText with deletions removed and additions inlined", () => {
    const { cleanedText } = parseRedlinedDoc(sample);
    expect(cleanedText).toContain("99.9%");
    expect(cleanedText).not.toContain("99.5%");
    expect(cleanedText).not.toContain("[INITECH ADD");
    expect(cleanedText).not.toContain("[INITECH COMMENT");
  });

  it("counts changes accurately", () => {
    const c = countChanges(sample);
    expect(c).toEqual({ additions: 2, deletions: 2, comments: 1 });
  });

  it("is robust to non-string input", () => {
    // @ts-expect-error – intentional bad input
    const parsed = parseRedlinedDoc(undefined);
    expect(parsed.segments).toEqual([]);
    expect(parsed.cleanedText).toBe("");
  });
});
