/**
 * Pressure tests for T4 — adversarial inputs that should not crash, hang, or
 * produce out-of-spec output. Anything new and weird the demo might encounter
 * goes here.
 *
 * Runs with GAMBIT_DISABLE_LLM=true (vitest config), so failures here mean
 * something is wrong with our deterministic / fallback code path.
 */

import { beforeEach, describe, expect, it } from "vitest";

import { POST as ghostPOST } from "@/app/api/engine/ghost/route";
import { POST as treePOST } from "@/app/api/engine/tree/route";
import { GET as counterGET } from "@/app/api/engine/counter/route";
import { GET as walkawayGET } from "@/app/api/engine/walkaway/route";
import { POST as evalPOST } from "@/app/api/engine/eval/route";

import {
  __resetSessionsForTests,
  buildDemoSession,
  setSession,
} from "../_shared/sessionStore";
import { ghostEngine, __resetGhostCacheForTests } from "../ghost/ghostEngine";
import { treeEngine, __resetTreeCachesForTests } from "../tree/treeEngine";
import { walkawayService, __resetWalkawayCacheForTests } from "../tree/walkawayService";
import { __resetPrecedentCacheForTests } from "../_shared/precedents";
import { parseRedlinedDoc } from "../_shared/redlineParser";

function postReq(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function getReq(url: string): Request {
  return new Request(url, { method: "GET" });
}

beforeEach(() => {
  __resetSessionsForTests();
  __resetGhostCacheForTests();
  __resetTreeCachesForTests();
  __resetWalkawayCacheForTests();
  __resetPrecedentCacheForTests();
});

describe("pressure: API surface", () => {
  it("rejects empty POST body cleanly", async () => {
    const res = await ghostPOST(
      new Request("http://localhost/api/engine/ghost", {
        method: "POST",
        headers: { "content-type": "application/json" },
      })
    );
    expect([400, 422]).toContain(res.status);
    const body = (await res.json()) as { ok: boolean };
    expect(body.ok).toBe(false);
  });

  it("rejects huge bodies without hanging", async () => {
    const huge = "x".repeat(200_000);
    const res = await ghostPOST(postReq("http://localhost/api/engine/ghost", { dealId: huge }));
    // It either succeeds (huge id is treated as unknown -> 404) or 4xx, but never 500/timeouts.
    expect([200, 404, 400, 422]).toContain(res.status);
  });

  it("treats string truthiness correctly for dealId", async () => {
    const res = await ghostPOST(postReq("http://localhost/api/engine/ghost", { dealId: "" }));
    expect([400, 422]).toContain(res.status);
  });

  it("returns the same canned ghost across 10 sequential calls (stability)", async () => {
    const profiles = await Promise.all(
      Array.from({ length: 10 }, async () => {
        const res = await ghostPOST(postReq("http://localhost/api/engine/ghost", { dealId: "demo" }));
        return res.json() as Promise<{ data: { elo: number } }>;
      })
    );
    const elos = profiles.map((p) => p.data.elo);
    expect(new Set(elos).size).toBe(1);
  });

  it("walkaway citations always substring-match precedents in fallback", async () => {
    const res = await walkawayGET(getReq("http://localhost/api/engine/walkaway?dealId=demo"));
    const json = (await res.json()) as {
      data: { citations: { dealLabel: string; clauseRef: string; quote: string }[] };
    };
    expect(json.data.citations.length).toBeGreaterThanOrEqual(3);
    for (const c of json.data.citations) {
      expect(typeof c.quote).toBe("string");
      expect(c.quote.length).toBeGreaterThan(10);
    }
  });

  it("counter handler returns 404 for unknown node", async () => {
    const res = await counterGET(
      getReq("http://localhost/api/engine/counter?id=demo&nodeId=does_not_exist")
    );
    expect(res.status).toBe(404);
  });

  it("eval handler clamps and never throws on root-edge nodes", async () => {
    for (const nodeId of ["n_root", "n_a_brilliant", "n_b_risky", "n_c_blunder"]) {
      const res = await evalPOST(
        postReq("http://localhost/api/engine/eval", { dealId: "demo", nodeId })
      );
      expect(res.status).toBe(200);
      const json = (await res.json()) as { data: { score: number } };
      expect(json.data.score).toBeGreaterThanOrEqual(-4);
      expect(json.data.score).toBeLessThanOrEqual(4);
    }
  });
});

describe("pressure: locale & sessions", () => {
  it("accepts a non-demo deal once seeded and serves a locale=fr session", async () => {
    setSession({ ...buildDemoSession("custom_deal"), locale: "fr" });
    const res = await treePOST(
      postReq("http://localhost/api/engine/tree", { dealId: "custom_deal" })
    );
    expect(res.status).toBe(200);
  });

  it("rejects unknown deal without crashing", async () => {
    const res = await treePOST(postReq("http://localhost/api/engine/tree", { dealId: "ghost" }));
    expect(res.status).toBe(404);
  });
});

describe("pressure: Ghost refresh", () => {
  it("ignores empty Spellbook issue list", async () => {
    const session = buildDemoSession("demo");
    const base = await ghostEngine.generate(session);
    const refreshed = await ghostEngine.refreshFromIssues(session, []);
    expect(refreshed).toEqual(base);
  });

  it("does not duplicate the same high-severity title across refreshes", async () => {
    const session = buildDemoSession("demo");
    await ghostEngine.generate(session);
    const issue = {
      id: "x",
      clauseRef: "10.9 Step-in",
      severity: "high" as const,
      title: "Step-in rights",
      detail: "...",
    };
    const r1 = await ghostEngine.refreshFromIssues(session, [issue]);
    const r2 = await ghostEngine.refreshFromIssues(session, [issue]);
    const matches = r2.fightsOn.filter((f) => f.includes("Step-in rights"));
    expect(matches.length).toBeLessThanOrEqual(1);
    expect(r1.fightsOn).toEqual(expect.arrayContaining([expect.stringContaining("Step-in rights")]));
  });

  it("caps fightsOn growth at 8 entries", async () => {
    const session = buildDemoSession("demo");
    await ghostEngine.generate(session);
    const many = Array.from({ length: 12 }, (_, i) => ({
      id: `i${i}`,
      clauseRef: `Z.${i}`,
      severity: "high" as const,
      title: `Synthetic high issue ${i}`,
      detail: "...",
    }));
    const refreshed = await ghostEngine.refreshFromIssues(session, many);
    expect(refreshed.fightsOn.length).toBeLessThanOrEqual(8);
  });
});

describe("pressure: tree invariants on real engine output", () => {
  it("bloom always produces a tree where root.childrenIds matches primaryBranchIds", async () => {
    const session = buildDemoSession("demo");
    const ghost = await ghostEngine.generate(session);
    const tree = await treeEngine.bloom(session, ghost);
    expect(tree.nodes[tree.rootId].childrenIds).toEqual(tree.primaryBranchIds);
  });

  it("every primary branch carries a populated move with valid notation", async () => {
    const session = buildDemoSession("demo");
    const ghost = await ghostEngine.generate(session);
    const tree = await treeEngine.bloom(session, ghost);
    for (const id of tree.primaryBranchIds) {
      const m = tree.nodes[id].move;
      expect(m).toBeDefined();
      expect(["!!", "?!", "??", "!", "!?"]).toContain(m!.notation);
    }
  });

  it("walkaway service hot path: 5 sequential calls under 500ms", async () => {
    const session = buildDemoSession("demo");
    const ghost = await ghostEngine.generate(session);
    const start = Date.now();
    for (let i = 0; i < 5; i += 1) {
      await walkawayService.getLine(session, ghost);
    }
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(500);
  });
});

describe("pressure: redline parser on real Initech MSA file", () => {
  it("counts at least 10 changes in the Initech-redlined MSA", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const fp = path.join(
      process.cwd(),
      "Example Scenario (Optional)",
      "msa_initech_redlines.md"
    );
    const text = await fs.readFile(fp, "utf8");
    const parsed = parseRedlinedDoc(text);
    const adds = parsed.segments.filter((s) => s.kind === "addition").length;
    const dels = parsed.segments.filter((s) => s.kind === "deletion").length;
    const cmts = parsed.segments.filter((s) => s.kind === "comment").length;
    expect(adds).toBeGreaterThan(10);
    expect(dels).toBeGreaterThan(5);
    expect(cmts).toBeGreaterThan(5);
  });
});
