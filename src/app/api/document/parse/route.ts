/**
 * POST /api/document/parse
 *
 * Accepts:
 *   - multipart/form-data with field `file` (PDF or DOCX)
 *   - or JSON body { filename: string, text?: string }
 *
 * Detects which hardcoded scenario the upload belongs to (Dunder vs Nimbus)
 * and returns scenario.paragraphs + scenario.frParagraphs. Filename markers
 * win first; if those miss we sniff the text content.
 */

import { fail, ok } from "@/lib/http";
import { detectScenario, getScenario } from "@/lib/scenarios";
import type { ParsedDocument } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 12 * 1024 * 1024;

export async function POST(req: Request): Promise<Response> {
  const ct = req.headers.get("content-type") ?? "";

  try {
    if (ct.startsWith("multipart/form-data")) {
      const form = await req.formData();
      const f = form.get("file");
      if (!(f instanceof File)) return fail("missing_file", "Send a `file`.", 400);
      if (f.size > MAX_BYTES) return fail("too_large", "Max 12 MB.", 413);
      const buf = new Uint8Array(await f.arrayBuffer());
      const sniffedText = await sniffText(buf, f.name, f.type);
      const sid = detectScenario(f.name, sniffedText);
      return ok(buildParsed(sid, f.name, f.type, buf.byteLength));
    }

    if (ct.includes("application/json")) {
      const body = (await req.json()) as { filename?: string; text?: string };
      const fname = (body.filename ?? "pasted.txt").trim();
      const txt = (body.text ?? "").trim();
      const sid = detectScenario(fname, txt);
      return ok(buildParsed(sid, fname, "text/plain", txt.length));
    }

    return fail("bad_content_type", "multipart/form-data or JSON only.", 415);
  } catch (e) {
    console.error("[parse] failed", e);
    return fail("parse_failed", (e as Error).message ?? "Could not parse.", 500);
  }
}

function buildParsed(
  scenarioId: ReturnType<typeof detectScenario>,
  filename: string,
  mime: string,
  byteSize: number,
): ParsedDocument {
  const s = getScenario(scenarioId);
  return {
    filename,
    mime,
    scenarioId,
    paragraphs: s.paragraphs.map((p) => p.en),
    frParagraphs: s.paragraphs.map((p) => p.fr),
    signatureBlockIndices: s.paragraphs
      .map((p, i) => (p.isSignatureBlock ? i : -1))
      .filter((i) => i >= 0),
    byteSize,
  };
}

async function sniffText(buf: Uint8Array, name: string, mime: string): Promise<string> {
  const lc = name.toLowerCase();
  const isPdf = mime.includes("pdf") || lc.endsWith(".pdf");
  const isDocx =
    mime.includes("officedocument.wordprocessingml") || lc.endsWith(".docx");
  try {
    if (isPdf) {
      const { extractText, getDocumentProxy } = await import("unpdf");
      const doc = await getDocumentProxy(buf);
      const r = await extractText(doc, { mergePages: true });
      return Array.isArray(r.text) ? r.text.join("\n") : r.text;
    }
    if (isDocx) {
      const mammoth = await import("mammoth");
      const out = await mammoth.extractRawText({ buffer: Buffer.from(buf) });
      return out.value;
    }
    return new TextDecoder().decode(buf);
  } catch {
    return "";
  }
}
