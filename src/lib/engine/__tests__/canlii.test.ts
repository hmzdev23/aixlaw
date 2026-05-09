import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetCanliiForTests,
  normalizeCitation,
  verifyCitation,
} from "../compliance/canliiClient";

describe("canliiClient", () => {
  beforeEach(() => {
    __resetCanliiForTests();
    delete process.env.CANLII_API_KEY;
    process.env.GAMBIT_DISABLE_CANLII = "true";
  });

  it("normalizes citations to a stable lowercase string", () => {
    expect(normalizeCitation("Bhasin v. Hrynew, 2014 SCC 71")).toBe(
      "bhasin v hrynew 2014 scc 71"
    );
    expect(normalizeCitation('"Sattva" — 2014 SCC 53')).toBe("sattva 2014 scc 53");
  });

  it("verifies a known case via the allowlist (full citation)", async () => {
    const hit = await verifyCitation("Bhasin v. Hrynew, 2014 SCC 71");
    expect(hit).not.toBeNull();
    expect(hit!.title).toBe("Bhasin v. Hrynew");
    expect(hit!.sourceUrl).toMatch(/canlii\.ca/);
  });

  it("verifies the same case from the neutral citation alone", async () => {
    const hit = await verifyCitation("2014 SCC 71");
    expect(hit).not.toBeNull();
    expect(hit!.neutralCitation).toBe("2014 SCC 71");
  });

  it("returns null for unknown citations (offline mode)", async () => {
    const hit = await verifyCitation("Foo v. Bar, 2099 ZZZ 1");
    expect(hit).toBeNull();
  });

  it("returns null for empty input", async () => {
    expect(await verifyCitation("")).toBeNull();
  });

  it("caches results across calls", async () => {
    const a = await verifyCitation("2014 SCC 71");
    const b = await verifyCitation("2014 SCC 71");
    expect(a).toBe(b);
  });
});
