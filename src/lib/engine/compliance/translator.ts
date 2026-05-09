import type { Translator } from "@/contracts";
import { TtlCache } from "../_shared/cache";
import { httpJson } from "../_shared/httpFetch";

/**
 * Google Cloud Translation v2 client (HTTPS, API-key auth — no SDK).
 *
 * Falls back to identity-with-warning when no key is configured so callers
 * never have to guard the call. Cache: 60 minutes (translations are stable).
 */

interface TranslateResponse {
  data: {
    translations: { translatedText: string }[];
  };
}

const cache = new TtlCache<string, string>(60 * 60 * 1000);

class CloudTranslationTranslator implements Translator {
  async toFr(text: string): Promise<string> {
    return this.translate(text, "fr");
  }
  async toEn(text: string): Promise<string> {
    return this.translate(text, "en");
  }

  private async translate(text: string, target: "fr" | "en"): Promise<string> {
    if (!text) return text;
    const key = process.env.GOOGLE_CLOUD_TRANSLATION_KEY?.trim();
    const cacheKey = `${target}:${text}`;
    const hit = cache.get(cacheKey);
    if (hit !== undefined) return hit;

    if (!key) {
      const fallback = `[FR translation unavailable — set GOOGLE_CLOUD_TRANSLATION_KEY] ${text}`;
      // Don't cache the warning version — switching env vars at runtime should re-eval.
      return target === "fr" ? fallback : text;
    }

    try {
      const url = `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(
        key
      )}`;
      const res = await httpJson<TranslateResponse>(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ q: text, target, format: "text" }),
        timeoutMs: 5000,
      });
      const translated = res.data?.translations?.[0]?.translatedText;
      if (translated) {
        cache.set(cacheKey, translated);
        return translated;
      }
    } catch {
      // fall through
    }
    // On any failure, return the text unchanged to keep downstream pipelines stable.
    cache.set(cacheKey, text);
    return text;
  }
}

export const translator: Translator = new CloudTranslationTranslator();

export function __resetTranslatorCacheForTests(): void {
  cache.clear();
}
