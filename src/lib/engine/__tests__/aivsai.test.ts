import { describe, expect, it } from "vitest";
import { aiVsAiService } from "../council/aiVsAi";
import { __resetGhostFixtureCacheForTests } from "../_shared/ghostFixtures";

describe("AiVsAiService (LLM disabled => canned)", () => {
  it("alternates left/right and ends on a concession", async () => {
    __resetGhostFixtureCacheForTests();
    const events = [];
    for await (const ev of aiVsAiService.runClauseNegotiation({
      clauseText:
        "MSA §7.1 — Vendor's total aggregate liability ... shall not apply to claims arising from a breach of Section 9.",
      leftGhostId: "initech_procurement",
      rightGhostId: "dunder_founder",
      maxRounds: 6,
    })) {
      events.push(ev);
    }
    expect(events.length).toBeGreaterThanOrEqual(2);
    // Strict alternation
    for (let i = 0; i < events.length; i += 1) {
      const expected = i % 2 === 0 ? "counterpart_left" : "counterpart_right";
      expect(events[i].agent).toBe(expected);
    }
    expect(events.at(-1)!.vote).toBe("accept");
  });

  it("rejects bad inputs", async () => {
    await expect(async () => {
      for await (const _ of aiVsAiService.runClauseNegotiation({
        clauseText: "",
        leftGhostId: "initech_procurement",
        rightGhostId: "dunder_founder",
        maxRounds: 4,
      })) void _;
    }).rejects.toMatchObject({ code: "bad_request" });

    await expect(async () => {
      for await (const _ of aiVsAiService.runClauseNegotiation({
        clauseText: "x".repeat(40),
        leftGhostId: "initech_procurement",
        rightGhostId: "dunder_founder",
        maxRounds: 0,
      })) void _;
    }).rejects.toMatchObject({ code: "bad_request" });
  });

  it("rejects unknown ghost id", async () => {
    await expect(async () => {
      for await (const _ of aiVsAiService.runClauseNegotiation({
        clauseText: "x".repeat(40),
        leftGhostId: "no_such_ghost",
        rightGhostId: "dunder_founder",
        maxRounds: 4,
      })) void _;
    }).rejects.toMatchObject({ code: "not_found" });
  });
});
