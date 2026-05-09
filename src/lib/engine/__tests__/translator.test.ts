import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  __resetTranslatorCacheForTests,
  translator,
} from "../compliance/translator";

describe("Translator (no API key => identity-with-warning fallback)", () => {
  beforeEach(() => {
    __resetTranslatorCacheForTests();
    delete process.env.GOOGLE_CLOUD_TRANSLATION_KEY;
  });

  afterEach(() => {
    __resetTranslatorCacheForTests();
  });

  it("toEn passes EN text through unchanged", async () => {
    const out = await translator.toEn("Hello world.");
    expect(out).toBe("Hello world.");
  });

  it("toFr emits a clear warning when the key is missing", async () => {
    const out = await translator.toFr("Hello world.");
    expect(out).toMatch(/^\[FR translation unavailable/);
  });

  it("does not throw on empty input", async () => {
    expect(await translator.toFr("")).toBe("");
    expect(await translator.toEn("")).toBe("");
  });
});
