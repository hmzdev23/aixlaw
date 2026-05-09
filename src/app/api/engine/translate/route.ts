import { z } from "zod";
import { fail, ok, readJson } from "@/lib/engine/_shared/apiHelpers";
import { translator } from "@/lib/engine/compliance/translator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/engine/translate
 * Body: { text, target: "fr" | "en" }
 */

const BodySchema = z.object({
  text: z.string().min(1).max(5000),
  target: z.union([z.literal("fr"), z.literal("en")]),
});

export async function POST(req: Request) {
  try {
    const { text, target } = await readJson(req, BodySchema);
    const out = target === "fr" ? await translator.toFr(text) : await translator.toEn(text);
    return ok({ text: out });
  } catch (e) {
    return fail(e);
  }
}
