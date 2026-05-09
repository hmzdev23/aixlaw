import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetWalkawayCacheForTests,
  loadCannedWalkaway,
  walkawayService,
  __testInternals as wInternals,
} from "../tree/walkawayService";
import { ghostEngine, __resetGhostCacheForTests } from "../ghost/ghostEngine";
import { buildDemoSession } from "../_shared/sessionStore";
import {
  __resetPrecedentCacheForTests,
  loadPrecedents,
} from "../_shared/precedents";

describe("WalkawayService (LLM disabled => canned)", () => {
  beforeEach(() => {
    __resetWalkawayCacheForTests();
    __resetGhostCacheForTests();
    __resetPrecedentCacheForTests();
  });

  it("returns at least 3 citations and a non-empty threshold summary", async () => {
    const session = buildDemoSession("demo");
    const ghost = await ghostEngine.generate(session);
    const line = await walkawayService.getLine(session, ghost);
    expect(line.citations.length).toBeGreaterThanOrEqual(3);
    expect(line.thresholdSummary.length).toBeGreaterThan(20);
  });

  it("every canned citation is a substring of one of the precedent clause texts", async () => {
    const canned = await loadCannedWalkaway();
    const precedents = await loadPrecedents();
    for (const cit of canned.citations) {
      const owner = precedents.find((p) => p.label === cit.dealLabel);
      expect(owner, `precedent labeled ${cit.dealLabel}`).toBeDefined();
      const clause = owner!.clauses.find((c) => c.ref === cit.clauseRef);
      expect(clause, `clause ${cit.clauseRef}`).toBeDefined();
      expect(clause!.text.includes(cit.quote)).toBe(true);
    }
  });

  it("verifyAndRepair replaces non-substring quotes with valid substrings", async () => {
    const precedents = await loadPrecedents();
    const candidate = {
      thresholdSummary: "synthetic test summary that exceeds the minimum length requirement.",
      citations: [
        {
          dealLabel: precedents[0].label,
          clauseRef: precedents[0].clauses[0].ref,
          quote: "TOTALLY MADE UP HALLUCINATED STRING NOT IN SOURCE",
        },
        {
          dealLabel: precedents[1].label,
          clauseRef: precedents[1].clauses[0].ref,
          quote: "ALSO MADE UP",
        },
        {
          dealLabel: precedents[2].label,
          clauseRef: precedents[2].clauses[0].ref,
          quote: "STILL MADE UP",
        },
      ],
    };
    const fixed = await wInternals.verifyAndRepair(candidate, precedents);
    for (const cit of fixed.citations) {
      const owner = precedents.find((p) => p.label === cit.dealLabel)!;
      const clause = owner.clauses.find((c) => c.ref === cit.clauseRef)!;
      expect(clause.text.includes(cit.quote)).toBe(true);
    }
  });
});
