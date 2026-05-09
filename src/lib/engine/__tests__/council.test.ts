import { beforeEach, describe, expect, it } from "vitest";
import { ghostEngine, __resetGhostCacheForTests } from "../ghost/ghostEngine";
import { __resetTreeCachesForTests } from "../tree/treeEngine";
import {
  councilService,
  loadCannedDebate,
  __resetCouncilCacheForTests,
  __testInternals,
} from "../council/councilService";
import {
  __resetCouncilStoreForTests,
  getLastCouncilResult,
} from "../council/store";
import { buildDemoSession } from "../_shared/sessionStore";

describe("CouncilService.deliberate (LLM disabled => canned)", () => {
  beforeEach(() => {
    __resetGhostCacheForTests();
    __resetTreeCachesForTests();
    __resetCouncilCacheForTests();
    __resetCouncilStoreForTests();
  });

  it("emits 5 ordered events with valid agents/votes", async () => {
    const session = buildDemoSession("demo");
    const ghost = await ghostEngine.generate(session);
    const events = [];
    for await (const ev of councilService.deliberate("n_a_brilliant", session, ghost)) {
      events.push(ev);
    }
    expect(events.length).toBe(5);
    const agents = events.map((e) => e.agent);
    expect(agents).toEqual(["counsel", "closer", "counterpart", "compliance", "crown"]);
    for (const e of events) {
      expect(e.message.length).toBeGreaterThan(3);
      expect(e.t).toBeGreaterThanOrEqual(0);
    }
    expect(events.at(-1)!.vote).toBe("accept"); // canned brilliant
  });

  it("synthesizes a CouncilResult with crown sentence", async () => {
    const session = buildDemoSession("demo");
    const ghost = await ghostEngine.generate(session);
    for await (const _ of councilService.deliberate("n_b_risky", session, ghost)) void _;
    const result = getLastCouncilResult("demo", "n_b_risky");
    expect(result).toBeDefined();
    expect(result!.finalRecommendation.startsWith("Following")).toBe(true);
    expect(result!.tally.crown).toBeDefined();
  });

  it("loadCannedDebate covers all three primary moves", async () => {
    for (const id of ["n_a_brilliant", "n_b_risky", "n_c_blunder"]) {
      const events = await loadCannedDebate(id);
      expect(events.length).toBe(5);
    }
  });

  it("synthesizeResultFromEvents drops AI-vs-AI sides from tally", () => {
    const events = [
      { t: 0, agent: "counterpart_left" as const, message: "left says...", vote: "accept" as const },
      { t: 1, agent: "crown" as const, message: "Following all: accept", vote: "accept" as const },
    ];
    const r = __testInternals.synthesizeResultFromEvents("m1", events);
    expect(r.tally.crown).toBe("accept");
    expect((r.tally as Record<string, unknown>).counterpart_left).toBeUndefined();
  });
});
