import { describe, expect, it } from "vitest";
import { chunkPrecedents } from "../ghost/chunker";
import { Retriever } from "../ghost/retrieve";
import { loadPrecedents, __resetPrecedentCacheForTests } from "../_shared/precedents";

describe("Retriever", () => {
  it("ranks the most relevant chunk first for a topic query", async () => {
    __resetPrecedentCacheForTests();
    const packs = await loadPrecedents();
    const r = new Retriever(chunkPrecedents(packs));
    const hits = r.search("ontario data residency cross-border", 3);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].chunk.clause.topic === "data_residency").toBe(true);
  });

  it("returns no hits for an empty query", async () => {
    const packs = await loadPrecedents();
    const r = new Retriever(chunkPrecedents(packs));
    expect(r.search("", 3)).toEqual([]);
  });

  it("indexes a non-trivial number of chunks", async () => {
    const packs = await loadPrecedents();
    const r = new Retriever(chunkPrecedents(packs));
    expect(r.size()).toBeGreaterThan(10);
  });
});
