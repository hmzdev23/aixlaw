/**
 * Pressure tests for T6 — adversarial inputs / edge cases / latency budgets.
 *
 * Runs offline: GAMBIT_DISABLE_CANLII=true, no Cloud Translation key.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { POST as compliancePOST } from "@/app/api/engine/compliance/route";
import { POST as translatePOST } from "@/app/api/engine/translate/route";
import { GET as notaryGET } from "@/app/api/engine/notary/route";
import { __resetSessionsForTests } from "../_shared/sessionStore";
import { __resetCanliiForTests } from "../compliance/canliiClient";
import { __resetTrueSightForTests, runTrueSight } from "../compliance/trueSight";
import { __resetPiaForTests } from "../compliance/piaGenerator";
import { __resetTranslatorCacheForTests } from "../compliance/translator";
import { __resetComplianceForTests, complianceService } from "../compliance";
import { realComplianceService } from "../compliance/complianceService";

beforeEach(() => {
  __resetSessionsForTests();
  __resetCanliiForTests();
  __resetTrueSightForTests();
  __resetPiaForTests();
  __resetTranslatorCacheForTests();
  __resetComplianceForTests();
  process.env.GAMBIT_DISABLE_CANLII = "true";
  delete process.env.GOOGLE_CLOUD_TRANSLATION_KEY;
});

function postReq(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("pressure: TrueSight scaling and edge cases", () => {
  it("handles a 50KB block of prose without exploding", async () => {
    const filler = "The quick brown fox jumps over the lazy dog. ".repeat(800); // ~38KB
    const text = `${filler}\nSee Bhasin v. Hrynew, 2014 SCC 71 for the duty of honest performance.`;
    const r = await runTrueSight(text);
    expect(r.status).toBe("clean");
    expect(r.claims.length).toBe(1);
    expect(r.extracted[0].raw).toContain("Bhasin");
  });

  it("handles 25 citations interleaved without duplicates from regex overlap", async () => {
    const cite = "Bhasin v. Hrynew, 2014 SCC 71";
    const blocks = Array.from({ length: 25 }, (_, i) => `Para ${i}: ${cite}.`);
    const r = await runTrueSight(blocks.join("\n"));
    expect(r.status).toBe("clean");
    expect(r.extracted.length).toBe(25);
  });

  it("returns a clean result for an entirely empty input", async () => {
    const r = await runTrueSight("");
    expect(r).toEqual({ status: "clean", claims: [], extracted: [] });
  });
});

describe("pressure: compliance API latency + concurrency", () => {
  it("10 concurrent /api/engine/compliance calls finish under 500ms", async () => {
    const make = () =>
      compliancePOST(
        postReq("http://localhost/api/engine/compliance", {
          text: "Vendor must comply with ISO 27001. Twenty-four (24) hour breach notification required.",
        })
      );
    const start = Date.now();
    const results = await Promise.all(Array.from({ length: 10 }, make));
    const elapsed = Date.now() - start;
    expect(results.every((r) => r.status === 200)).toBe(true);
    expect(elapsed).toBeLessThan(500);
  });

  it("rejects a body that exceeds the 200KB text cap", async () => {
    const huge = "x".repeat(300_000);
    const res = await compliancePOST(
      postReq("http://localhost/api/engine/compliance", { text: huge })
    );
    expect(res.status).toBe(422);
  });
});

describe("pressure: T5 plug-in seam", () => {
  it("complianceService() default returns the real impl now (not the T5 stub)", async () => {
    const r = await complianceService().checkProposedText("plain text", "en");
    expect(r.osfi.triggered).toBe(false);
  });
});

describe("pressure: notary signal", () => {
  it("returns required=false on a non-Quebec, non-subprocessor session", async () => {
    // Use a custom session via direct module access to avoid relying on demo-force.
    const { setSession, buildDemoSession } = await import("../_shared/sessionStore");
    setSession({ ...buildDemoSession("custom_no_law25"), activeDocumentId: undefined });
    const res = await notaryGET(
      new Request("http://localhost/api/engine/notary?dealId=custom_no_law25")
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { required: boolean } };
    expect(json.data.required).toBe(false);
  });
});

describe("pressure: translator", () => {
  it("survives 100 cached calls without crash", async () => {
    for (let i = 0; i < 100; i += 1) {
      const res = await translatePOST(
        postReq("http://localhost/api/engine/translate", {
          text: "Hello world.",
          target: "en",
        })
      );
      expect(res.status).toBe(200);
    }
  });
});

describe("pressure: PIA token substitution", () => {
  it("substitutes vendor / counterparty tokens deterministically", async () => {
    const r = await realComplianceService.checkProposedTextEx("plain", "en", {
      forceLaw25: true,
      piaTokens: {
        vendor_displayName: "Dunder AI",
        counterparty_displayName: "Initech Financial Group",
      },
    });
    expect(r.law25.pia).toBeDefined();
    expect(r.law25.pia!.sectionsEn.purposes).toContain("Dunder AI");
    expect(r.law25.pia!.sectionsEn.purposes).toContain("Initech Financial Group");
  });
});
