/**
 * POST /api/esig
 * Body: { text: string }
 *
 * Returns whether the contract is e-signable in Quebec under
 * the Act to establish a legal framework for information technology
 * (CQLR c. C-1.1) + UECA, and surfaces any signature blocks present.
 */

import { z } from "zod";
import { fail, ok } from "@/lib/http";
import type { EsigResult } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ text: z.string().min(20) });

const SIG_RE =
  /(?:^|\n)\s*(?:_{3,}|sign(?:ature|é\(e\))?\s*[:_-]?\s*[_-]{2,}|x\s*[_-]{3,}|by\s*[:_-]?\s*[_-]{3,})/gi;

const QC_BAR_RE =
  /\b(handwritten|wet[- ]ink|notari[sz]ed by a Qu[ée]bec notary|requires? a notary)\b/i;

const QC_FRIENDLY_RE =
  /\b(electronic signature|signature électronique|consents to electronic signing)\b/i;

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail("bad_json", "Request body must be JSON.", 400);
  }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return fail("bad_input", "Need { text }.", 400);

  const text = parsed.data.text;
  const sigCount = (text.match(SIG_RE) ?? []).length;
  const qcFriendly = QC_FRIENDLY_RE.test(text);
  const qcBar = QC_BAR_RE.test(text);

  const notes: string[] = [];
  let qcAvailable = true;

  if (qcBar) {
    qcAvailable = false;
    notes.push(
      "Contract contains language requiring wet-ink or notarised signature — e-signature alone may not suffice.",
    );
  }
  if (qcFriendly) {
    notes.push("Contract explicitly contemplates electronic signing — good signal.");
  }
  if (sigCount === 0) {
    notes.push("No clear signature block found — you may need to add one before sending.");
  } else {
    notes.push(`${sigCount} signature block(s) detected.`);
  }

  notes.push(
    "General rule: Quebec recognises e-signatures under CQLR c. C-1.1 and UECA, provided the signer's identity and intent are reliably linked to the document.",
  );

  const result: EsigResult = {
    qcAvailable,
    signatureBlocksFound: sigCount,
    notes,
    citations: [
      {
        label: "Act to establish a legal framework for information technology, CQLR c. C-1.1",
        url: "https://www.legisquebec.gouv.qc.ca/en/document/cs/c-1.1",
      },
      {
        label: "Uniform Electronic Commerce Act (UECA)",
        url: "https://www.ulcc-chlc.ca/Civil-Section/Uniform-Acts/Electronic-Commerce-Act",
      },
    ],
  };

  return ok(result);
}
