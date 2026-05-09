import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { redact } from "@/lib/redact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  text: z.string().min(1),
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
  if (!parsed.success) return fail("bad_input", "Need { text }.", 400);
  return ok(redact(parsed.data.text, parsed.data.extraNames ?? []));
}
