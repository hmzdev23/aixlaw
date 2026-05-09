/**
 * POST /api/translate
 * Body: { paragraphs: string[], target: "fr" | "en" }
 *
 * Uses Anthropic if available; otherwise returns a deterministic prefix-flagged
 * translation so the UI still flips and the flow keeps working.
 */

import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { complete, hasLLM } from "@/lib/anthropic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  paragraphs: z.array(z.string().min(1)).min(1).max(400),
  target: z.enum(["fr", "en"]),
});

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail("bad_json", "Request body must be JSON.", 400);
  }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return fail("bad_input", parsed.error.issues[0]?.message ?? "bad input", 400);

  const { paragraphs, target } = parsed.data;
  const out: string[] = new Array(paragraphs.length);

  if (!hasLLM()) {
    for (let i = 0; i < paragraphs.length; i += 1) {
      out[i] =
        target === "fr"
          ? mockToFrench(paragraphs[i])
          : mockToEnglish(paragraphs[i]);
    }
    return ok({ paragraphs: out, mode: "mock" });
  }

  // Translate in batches to keep prompts small.
  const BATCH = 6;
  for (let i = 0; i < paragraphs.length; i += BATCH) {
    const chunk = paragraphs.slice(i, i + BATCH);
    const numbered = chunk.map((p, j) => `[${j + 1}]\n${p}`).join("\n\n");
    const sys =
      target === "fr"
        ? "You are a professional legal translator. Translate the user's English contract paragraphs into clear, fluent Quebec French. Preserve numbering. Reply with only the translations in the same [n] format."
        : "You are a professional legal translator. Translate the user's French contract paragraphs into clear English. Preserve numbering. Reply with only the translations in the same [n] format.";
    const text = await complete({
      system: sys,
      user: numbered,
      maxTokens: 1500,
      temperature: 0.2,
    });
    const parsedChunk = parseNumbered(text, chunk.length);
    for (let j = 0; j < chunk.length; j += 1) {
      out[i + j] = parsedChunk[j] || (target === "fr" ? mockToFrench(chunk[j]) : mockToEnglish(chunk[j]));
    }
  }

  return ok({ paragraphs: out, mode: "llm" });
}

function parseNumbered(blob: string, expected: number): string[] {
  const out: string[] = new Array(expected).fill("");
  if (!blob) return out;
  const re = /\[(\d+)\]\s*([\s\S]*?)(?=\n\[\d+\]|\s*$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(blob)) !== null) {
    const idx = Number(m[1]) - 1;
    if (idx >= 0 && idx < expected) out[idx] = m[2].trim();
  }
  return out;
}

function mockToFrench(en: string): string {
  return `[FR ébauche] ${en}`;
}

function mockToEnglish(fr: string): string {
  return `[EN draft] ${fr}`;
}
