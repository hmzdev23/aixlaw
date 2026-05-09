/**
 * GET /api/workproduct/supervisor?dealId=<id>&mode=legal|plain
 *
 * Returns the Supervisor PDF in the requested mode. `legal` is the default
 * because that's what the GC reviews; the demo flips to `plain` to show
 * Sarah's exec the human-readable version.
 */

import { fail } from "@/lib/http";
import { getDecision } from "@/lib/workproduct/decisionStore";
import { getWorkProductService } from "@/lib/workproduct/service";
import { logger } from "@/lib/util/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PDF_MIME = "application/pdf";

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const dealId = url.searchParams.get("dealId");
  const modeRaw = url.searchParams.get("mode") ?? "legal";
  if (!dealId) {
    return fail("missing_dealId", "Provide ?dealId=...", 400);
  }
  if (modeRaw !== "legal" && modeRaw !== "plain") {
    return fail("bad_mode", "mode must be 'legal' or 'plain'.", 400);
  }
  const decision = getDecision(dealId);
  if (!decision) {
    return fail(
      "not_found",
      `No Decision stored for dealId=${dealId}.`,
      404,
    );
  }

  try {
    const bytes = await getWorkProductService().buildSupervisorPdf(
      decision,
      modeRaw,
    );
    const filename = `Gambit_Supervisor_${modeRaw}_${dealId}.pdf`;
    return new Response(new Blob([bytes as unknown as BlobPart], { type: PDF_MIME }), {
      status: 200,
      headers: {
        "Content-Type": PDF_MIME,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (err) {
    logger.error("supervisor pdf build failed", {
      err: (err as Error).message,
    });
    return fail("internal", "PDF generation failed.", 500);
  }
}
