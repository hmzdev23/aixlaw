import { describe, expect, it, beforeEach } from "vitest";
import { architectRuntime } from "../architect/runtime";
import { playbookRepository } from "../architect/repository";
import {
  buildDemoSession,
  __resetSessionsForTests,
} from "../_shared/sessionStore";
import {
  rememberDecision,
  __resetDecisionStore,
} from "@/lib/workproduct/decisionStore";
import { getWorkProductService } from "@/lib/workproduct/service";
import { getExecutionEngine } from "@/lib/execution/engine";
import { __resetTimeline } from "@/lib/execution/timeline";

describe("Architect → workproduct → execution", () => {
  beforeEach(() => {
    __resetSessionsForTests();
    __resetDecisionStore();
    __resetTimeline();
    process.env.GAMBIT_DISABLE_LLM = "true";
  });

  it("execute default playbook → store decision → docx + supervisor PDF → execution timeline", async () => {
    const session = buildDemoSession("demo-arch-exec");
    const playbook = await playbookRepository.get("pb_default");
    const decision = await architectRuntime.execute(playbook, session);

    expect(decision.dealId).toBe(session.dealId);
    expect(decision.chosenMoveId.length).toBeGreaterThan(0);

    rememberDecision(decision);

    const wp = getWorkProductService();
    const docx = await wp.buildCounterRedlineDocx(decision);
    expect(docx.byteLength).toBeGreaterThan(2000);

    const pdfLegal = await wp.buildSupervisorPdf(decision, "legal");
    expect(pdfLegal.byteLength).toBeGreaterThan(800);

    const pdfPlain = await wp.buildSupervisorPdf(decision, "plain");
    expect(pdfPlain.byteLength).toBeGreaterThan(800);

    const engine = getExecutionEngine();
    const terminal: { step: string; status: string }[] = [];
    for await (const ev of engine.fire(decision)) {
      if (ev.status === "done" || ev.status === "error") {
        terminal.push({ step: ev.step, status: ev.status });
      }
    }

    expect(terminal.length).toBe(5);
    const steps = terminal.map((t) => t.step);
    expect(steps).toEqual([
      "email_received",
      "counter_sent",
      "invoice_generated",
      "seats_provisioned",
      "notary_queued",
    ]);
  });
});
