import { promises as fs } from "node:fs";
import path from "node:path";
import { fail, ok, requireSearchParam } from "@/lib/engine/_shared/apiHelpers";
import { realComplianceService } from "@/lib/engine/compliance/complianceService";
import {
  getOrCreateDemoSession,
  getSession,
} from "@/lib/engine/_shared/sessionStore";
import { repoRoot } from "@/lib/engine/_shared/paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/engine/notary?dealId=<id>
 *
 * Re-runs compliance against the active document text and returns a clean
 * boolean for the Cockpit + execution timeline (T9 notary queue).
 *
 *   { required: boolean, reason: string }
 *
 * Rule:
 *   - For demo dealId, force Law 25 to fire so the narrative beat works
 *     even if the active document text doesn't include the contrived hypo.
 *   - Otherwise, `required` reflects `law25.triggered` from the live engine.
 */

export async function GET(req: Request) {
  try {
    const dealId = requireSearchParam(req, "dealId");
    const session = dealId === "demo" ? getOrCreateDemoSession() : getSession(dealId);

    // Pull the active document text (best-effort — empty string is fine).
    const text = await loadActiveDocumentText(session.activeDocumentId, session.documents);

    const report = await realComplianceService.checkProposedTextEx(
      text ?? "",
      session.locale,
      {
        dealId,
        forceLaw25: dealId === "demo",
      }
    );

    if (report.law25.triggered) {
      return ok({
        required: true,
        reason:
          report.law25.triggers[0] ??
          "Quebec Law 25 trigger present — notary involvement recommended for cross-border safeguards.",
      });
    }
    return ok({
      required: false,
      reason: "No Quebec Law 25 trigger — notary not required.",
    });
  } catch (e) {
    return fail(e);
  }
}

async function loadActiveDocumentText(
  activeId: string | undefined,
  documents: { id: string; redlinedRef?: string; originalRef?: string }[]
): Promise<string> {
  const doc = documents.find((d) => d.id === activeId);
  const ref = doc?.redlinedRef ?? doc?.originalRef;
  if (!ref) return "";
  try {
    return await fs.readFile(path.join(repoRoot(), ref), "utf8");
  } catch {
    return "";
  }
}
