import { beforeEach, describe, expect, it } from "vitest";
import { __resetCanliiForTests } from "../compliance/canliiClient";
import {
  __resetTrueSightForTests,
  extractCitations,
  runTrueSight,
} from "../compliance/trueSight";

describe("TrueSight", () => {
  beforeEach(() => {
    __resetCanliiForTests();
    __resetTrueSightForTests();
    process.env.GAMBIT_DISABLE_CANLII = "true";
  });

  it("extracts neutral citations including the leading case-name", () => {
    const text =
      "We rely on Bhasin v. Hrynew, 2014 SCC 71 and Sattva Capital Corp. v. Creston Moly Corp., 2014 SCC 53.";
    const ec = extractCitations(text);
    expect(ec.length).toBe(2);
    expect(ec[0].raw).toContain("Bhasin v. Hrynew");
    expect(ec[1].raw).toContain("Sattva Capital");
  });

  it("returns clean status when no citations are present", async () => {
    const r = await runTrueSight("Just plain prose with no citations.");
    expect(r.status).toBe("clean");
    expect(r.claims).toEqual([]);
    expect(r.extracted).toEqual([]);
  });

  it("verifies a real citation via the allowlist", async () => {
    const r = await runTrueSight("See Bhasin v. Hrynew, 2014 SCC 71.");
    expect(r.status).toBe("clean");
    expect(r.claims[0].verified).toContain("Bhasin");
    expect(r.claims[0].sourceUrl).toMatch(/canlii\.ca/);
  });

  it("substitutes the canned bad citation when dealId === demo", async () => {
    const r = await runTrueSight(
      "Per the holding in Beaulieu v. Provincial Insurance, 2021 QCCA 412, the carve-out fails.",
      { dealId: "demo" }
    );
    expect(r.status).toBe("substituted");
    const subbed = r.claims.find((c) => c.original.includes("Beaulieu"));
    expect(subbed).toBeDefined();
    expect(subbed!.verified).toContain("Bhasin v. Hrynew");
  });

  it("marks unknown citations as unverified", async () => {
    const r = await runTrueSight("In Foo v. Bar, 2099 SCC 1, we read...");
    expect(r.status).toBe("unverified");
    expect(r.claims[0].verified).toBeUndefined();
  });

  it("returns valid (start, end) spans for each extraction", async () => {
    const text = "See Bhasin v. Hrynew, 2014 SCC 71 directly.";
    const r = await runTrueSight(text);
    expect(r.extracted.length).toBe(1);
    const ec = r.extracted[0];
    expect(text.slice(ec.start, ec.end)).toBe(ec.raw);
  });
});
