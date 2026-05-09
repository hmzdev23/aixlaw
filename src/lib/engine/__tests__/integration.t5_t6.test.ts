import { describe, expect, it, beforeEach } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { __resetComplianceForTests, complianceService } from "../compliance";
import {
  councilService,
  __resetCouncilCacheForTests,
} from "../council/councilService";
import { ghostEngine } from "../ghost/ghostEngine";
import { treeEngine } from "../tree/treeEngine";
import {
  buildDemoSession,
  __resetSessionsForTests,
} from "../_shared/sessionStore";

describe("T5 Council + T6 Compliance integration", () => {
  beforeEach(() => {
    __resetSessionsForTests();
    __resetCouncilCacheForTests();
    __resetComplianceForTests();
    process.env.GAMBIT_DISABLE_LLM = "true";
    process.env.GAMBIT_DISABLE_CANLII = "true";
  });

  it("full Initech MSA triggers OSFI + PIPEDA via the same compliance service Council uses", async () => {
    const fp = path.join(
      process.cwd(),
      "Example Scenario (Optional)",
      "msa_initech_redlines.md",
    );
    const text = await readFile(fp, "utf8");
    const report = await complianceService().checkProposedText(text, "en");
    expect(report.osfi.triggered).toBe(true);
    expect(report.osfi.triggers.length).toBeGreaterThanOrEqual(3);
    expect(report.pipeda.triggered).toBe(true);
  });

  it("council streams events for a primary move on the demo session (canned path)", async () => {
    const session = buildDemoSession("demo-t5-t6");
    const ghost = await ghostEngine.generate(session);
    const tree = await treeEngine.bloom(session, ghost);
    const moveId = tree.primaryBranchIds[0];
    const node = tree.nodes[moveId];
    expect(node?.move).toBeDefined();

    const moveText = `${node!.move!.label}\n${node!.move!.summary}`;
    const moveCompliance = await complianceService().checkProposedText(
      moveText,
      session.locale,
    );
    expect(["clean", "substituted", "unverified"]).toContain(
      moveCompliance.trueSight.status,
    );

    const events: { agent: string }[] = [];
    for await (const ev of councilService.deliberate(moveId, session, ghost)) {
      events.push({ agent: String(ev.agent) });
    }
    expect(events.length).toBeGreaterThanOrEqual(4);
    expect(events.some((e) => e.agent === "crown")).toBe(true);
  });
});
