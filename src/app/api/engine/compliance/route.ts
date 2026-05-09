import { z } from "zod";
import { fail, ok, readJson } from "@/lib/engine/_shared/apiHelpers";
import { realComplianceService } from "@/lib/engine/compliance/complianceService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/engine/compliance
 *
 * Body: { text, locale, dealId?, forceLaw25?, piaTokens? }
 *
 * `dealId` enables the TrueSight demo-inject path; `forceLaw25` is used by
 * the notary endpoint and demo replay.
 */

const BodySchema = z.object({
  text: z.string().max(200_000),
  locale: z.union([z.literal("en"), z.literal("fr")]).optional(),
  dealId: z.string().optional(),
  forceLaw25: z.boolean().optional(),
  piaTokens: z.record(z.string(), z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await readJson(req, BodySchema);
    const locale: "en" | "fr" = body.locale ?? "en";
    const ex = await realComplianceService.checkProposedTextEx(body.text, locale, {
      dealId: body.dealId,
      forceLaw25: body.forceLaw25,
      piaTokens: body.piaTokens,
    });
    const { _extracted: _, ...report } = ex;
    void _;
    return ok(report);
  } catch (e) {
    return fail(e);
  }
}
