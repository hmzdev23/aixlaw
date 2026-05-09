/**
 * GET /api/workproduct/docx?dealId=<id>
 *
 * Returns the generated counter-redline .docx for the most-recently-stored
 * Decision under that dealId. Fails 404 if no Decision was POSTed first.
 *
 * Content-Type is the standard wordprocessingml mime so browsers download
 * with the correct extension and Word recognizes the file.
 */

import { fail } from "@/lib/http";
import { getDecision } from "@/lib/workproduct/decisionStore";
import { getWorkProductService } from "@/lib/workproduct/service";
import { logger } from "@/lib/util/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const dealId = url.searchParams.get("dealId");
  if (!dealId) {
    return fail("missing_dealId", "Provide ?dealId=...", 400);
  }
  const decision = getDecision(dealId);
  if (!decision) {
    return fail(
      "not_found",
      `No Decision stored for dealId=${dealId}. POST /api/workproduct/decision first.`,
      404,
    );
  }

  try {
    const bytes = await getWorkProductService().buildCounterRedlineDocx(
      decision,
    );
    const filename = `Dunder_counter_${decision.chosenMoveId}_${dealId}.docx`;
    return new Response(new Blob([bytes as unknown as BlobPart], { type: DOCX_MIME }), {
      status: 200,
      headers: {
        "Content-Type": DOCX_MIME,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (err) {
    logger.error("docx build failed", { err: (err as Error).message });
    return fail("internal", "DOCX generation failed.", 500);
  }
}
