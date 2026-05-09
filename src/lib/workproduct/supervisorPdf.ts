/**
 * Supervisor PDF renderer entrypoint. Server-only.
 *
 * @react-pdf/renderer streams a `Document` element to a buffer in Node. We
 * dispatch on `mode` to pick the Legal vs Plain-English template and return
 * raw PDF bytes shaped as Uint8Array (matching the WorkProductService contract).
 */

import { renderToBuffer } from "@react-pdf/renderer";
import type { Decision } from "@/lib/contracts";
import {
  SupervisorLegalPdf,
} from "./templates/supervisorLegal";
import {
  SupervisorPlainPdf,
} from "./templates/supervisorPlain";

export type SupervisorMode = "legal" | "plain";

interface BuildOpts {
  decision: Decision;
  mode: SupervisorMode;
  documentFocus: "nda" | "msa";
}

export async function buildSupervisorPdf(opts: BuildOpts): Promise<Uint8Array> {
  const element =
    opts.mode === "plain"
      ? SupervisorPlainPdf({
          decision: opts.decision,
          documentFocus: opts.documentFocus,
        })
      : SupervisorLegalPdf({
          decision: opts.decision,
          documentFocus: opts.documentFocus,
        });

  const buffer = await renderToBuffer(element);
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}
