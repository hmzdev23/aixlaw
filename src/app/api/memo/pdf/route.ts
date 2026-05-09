/**
 * POST /api/memo/pdf
 * Body: { title, goal, finalScore, decisions: {label,delta}[], highlights: string[], redact?: boolean, extraNames?: string[] }
 * Returns: application/pdf
 */

import { z } from "zod";
import { fail } from "@/lib/http";
import { redact } from "@/lib/redact";
import { renderMemoPdf } from "@/lib/memoPdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  title: z.string().min(1),
  goal: z.string().default(""),
  finalScore: z.number(),
  decisions: z
    .array(z.object({ label: z.string(), delta: z.number() }))
    .default([]),
  highlights: z.array(z.string()).default([]),
  redact: z.boolean().optional(),
  extraNames: z.array(z.string()).optional(),
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

  const data = parsed.data;
  let redactionTotal = 0;
  if (data.redact) {
    data.goal = redact(data.goal, data.extraNames ?? []).text;
    data.decisions = data.decisions.map((d) => {
      const r = redact(d.label, data.extraNames ?? []);
      redactionTotal += r.total;
      return { ...d, label: r.text };
    });
    data.highlights = data.highlights.map((h) => {
      const r = redact(h, data.extraNames ?? []);
      redactionTotal += r.total;
      return r.text;
    });
  }

  try {
    const bytes = await renderMemoPdf({
      title: data.title,
      goal: data.goal,
      finalScore: data.finalScore,
      decisions: data.decisions,
      highlights: data.highlights,
      redactionTotal,
    });
    return new Response(new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }), {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${safeName(data.title)}.pdf"`,
      },
    });
  } catch (e) {
    console.error("[memo.pdf] failed", e);
    return fail("pdf_failed", (e as Error).message ?? "PDF render failed", 500);
  }
}

function safeName(s: string): string {
  return s.replace(/[^a-z0-9]+/gi, "_").slice(0, 64) || "memo";
}
