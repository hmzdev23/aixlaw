/**
 * GET /api/spellbook/issues?dealId=<id>&kind=msa|nda
 *
 * Returns the Spellbook issue list for the active document. T4 (Aditya) calls
 * this from `GhostEngine.refreshFromIssues`. We always return SOMETHING — the
 * client falls through to the bundled fixture if the Spellbook API is down,
 * and fixtures are aligned to redline IDs R01–R13 / N01–N05.
 */

import { promises as fs } from "node:fs";
import { fail, ok } from "@/lib/http";
import { getInboundEvent } from "@/lib/integrations/inbound/store";
import { getSpellbookClient } from "@/lib/integrations/spellbook/client";
import { fixturePath, FIXTURE_PATHS } from "@/lib/util/fixturePath";
import { logger } from "@/lib/util/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const dealId = url.searchParams.get("dealId");
  const explicitKind = url.searchParams.get("kind");
  if (explicitKind && explicitKind !== "msa" && explicitKind !== "nda") {
    return fail("bad_kind", "kind must be 'msa' or 'nda'.", 400);
  }

  let kind: "msa" | "nda" =
    explicitKind === "nda" ? "nda" : explicitKind === "msa" ? "msa" : "msa";

  if (dealId && !explicitKind) {
    const inbound = getInboundEvent(dealId);
    if (inbound?.documentFocus) kind = inbound.documentFocus;
  }

  let text = "";
  try {
    const fixturePathRel =
      kind === "nda" ? FIXTURE_PATHS.ndaRedlined : FIXTURE_PATHS.msaRedlined;
    text = await fs.readFile(fixturePath(fixturePathRel), "utf-8");
  } catch (err) {
    logger.warn("spellbook: fixture read failed; using empty text", {
      err: (err as Error).message,
    });
  }

  const issues = await getSpellbookClient().detectIssues(text, { kind });
  return ok({ kind, issues, count: issues.length });
}
