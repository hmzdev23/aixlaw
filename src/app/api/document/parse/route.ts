/**
 * POST /api/document/parse
 *
 * Accepts:
 *   - multipart/form-data with field `file` (PDF or DOCX)
 *   - or JSON body { text: string, filename?: string }
 *
 * Returns the extracted plain text + per-paragraph splits.
 */

import { fail, ok } from "@/lib/http";
import type { ParsedDocument } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB

export async function POST(req: Request): Promise<Response> {
  const contentType = req.headers.get("content-type") ?? "";

  try {
    if (contentType.startsWith("multipart/form-data")) {
      const form = await req.formData();
      const f = form.get("file");
      if (!(f instanceof File)) {
        return fail("missing_file", "Send a `file` form field.", 400);
      }
      if (f.size > MAX_BYTES) {
        return fail("too_large", "Max 12 MB.", 413);
      }
      const buf = new Uint8Array(await f.arrayBuffer());
      const parsed = await extractFromBuffer(buf, f.name, f.type);
      return ok<ParsedDocument>(parsed);
    }

    if (contentType.includes("application/json")) {
      const body = (await req.json()) as { text?: string; filename?: string };
      const text = (body.text ?? "").trim();
      if (!text) return fail("empty", "Provide text.", 400);
      return ok<ParsedDocument>(buildFromText(text, body.filename ?? "pasted.txt", "text/plain"));
    }

    return fail("bad_content_type", "Send multipart/form-data or JSON.", 415);
  } catch (e) {
    console.error("[parse] failed", e);
    return fail("parse_failed", (e as Error).message ?? "Could not parse.", 500);
  }
}

async function extractFromBuffer(
  buf: Uint8Array,
  filename: string,
  mime: string,
): Promise<ParsedDocument> {
  const lc = filename.toLowerCase();
  const isPdf = mime.includes("pdf") || lc.endsWith(".pdf");
  const isDocx =
    mime.includes("officedocument.wordprocessingml") || lc.endsWith(".docx");
  const isText = mime.startsWith("text/") || lc.endsWith(".txt") || lc.endsWith(".md");

  if (isPdf) {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const doc = await getDocumentProxy(buf);
    const numPages = doc.numPages;
    const result = await extractText(doc, { mergePages: true });
    const text = Array.isArray(result.text) ? result.text.join("\n") : result.text;
    return buildFromText(text, filename, mime || "application/pdf", numPages, buf.byteLength);
  }
  if (isDocx) {
    const mammoth = await import("mammoth");
    const out = await mammoth.extractRawText({ buffer: Buffer.from(buf) });
    return buildFromText(
      out.value,
      filename,
      mime || "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      undefined,
      buf.byteLength,
    );
  }
  if (isText) {
    const text = new TextDecoder().decode(buf);
    return buildFromText(text, filename, mime || "text/plain", undefined, buf.byteLength);
  }
  throw new Error(`Unsupported file type: ${mime || filename}`);
}

function buildFromText(
  raw: string,
  filename: string,
  mime: string,
  pages?: number,
  byteSize?: number,
): ParsedDocument {
  const text = raw.replace(/\r\n/g, "\n").replace(/\u0000/g, "").trim();
  let paragraphs = text
    .split(/\n{2,}|\n(?=[A-Z0-9§])/)
    .map((p) => p.replace(/\n+/g, " ").trim())
    .filter((p) => p.length > 0);
  // PDF text often arrives as one long blob — re-chunk by sentence groups.
  if (paragraphs.length <= 2 && text.length > 800) {
    const sentences = text
      .replace(/\n+/g, " ")
      .split(/(?<=[.?!])\s+(?=[A-Z(§"'])/g)
      .map((s) => s.trim())
      .filter(Boolean);
    const chunked: string[] = [];
    let buf = "";
    for (const s of sentences) {
      if ((buf + " " + s).trim().length > 360 && buf.length > 0) {
        chunked.push(buf.trim());
        buf = s;
      } else {
        buf = buf ? `${buf} ${s}` : s;
      }
    }
    if (buf.trim().length > 0) chunked.push(buf.trim());
    if (chunked.length > paragraphs.length) paragraphs = chunked;
  }
  return {
    filename,
    mime,
    text,
    pages,
    paragraphs,
    byteSize: byteSize ?? new TextEncoder().encode(text).length,
  };
}
