/**
 * POST /api/chat/export
 * Body: { text: string, redact?: boolean, extraNames?: string[] }
 * Returns plain-text body of the chat as text/markdown for download.
 */

import { z } from "zod";
import { fail } from "@/lib/http";
import { redact } from "@/lib/redact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  text: z.string().min(1),
  redact: z.boolean().optional(),
  extraNames: z.array(z.string()).optional(),
  filename: z.string().optional(),
});

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail("bad_json", "Request body must be JSON.", 400);
  }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return fail("bad_input", "Need { text }.", 400);
  const text = parsed.data.redact
    ? redact(parsed.data.text, parsed.data.extraNames ?? []).text
    : parsed.data.text;

  const filename =
    parsed.data.filename ??
    (parsed.data.redact ? "warroom-chat.redacted.md" : "warroom-chat.md");

  return new Response(text, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}
