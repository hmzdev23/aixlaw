import type { Law25Result, PIA } from "@/contracts";
import { buildPIA } from "./piaGenerator";

/**
 * Quebec Law 25 (Loi 25 — modernization of personal-information protection).
 *
 * Per the demo brief, this is a **secondary** beat. We deliberately fire ONLY
 * on the contrived hypothetical scenario:
 *   - A Quebec-resident or Quebec-branch data signal, AND
 *   - A US-hosted analytics subprocessor signal
 *
 * The resulting Law25Result is **labeled as a demo extension** in its first
 * trigger string for honesty in Q&A (per RISK_REGISTER R7).
 */

const QUEBEC_TRIGGER_RE =
  /(quebec|québec|quebec-resident|quebec residents|quebec branch|montreal|montréal)/i;

const US_SUBPROCESSOR_RE =
  /(u\.s\.[- ]?based subprocessor|us[- ]?based subprocessor|us[- ]?hosted analytics|cross-border data transfer.*united states|us subprocessor|hosted in the united states)/i;

export interface Law25Options {
  /** When true, `triggered` is forced regardless of detection (used by demo path). */
  forceTrigger?: boolean;
  /** Tokens used for PIA template substitution. */
  templateTokens?: Record<string, string>;
  /** When true (default), add an EN+FR PIA. */
  generatePia?: boolean;
}

export const LAW25_DEMO_NOTICE =
  "DEMO EXTENSION: this Law 25 trigger is a hypothetical scenario layer (US-hosted analytics subprocessor + Quebec-resident data). It is generated for the Gambit demo, not derived from the live Initech MSA text. See SCENARIO_CONTEXT.md.";

export async function runLaw25(text: string, opts: Law25Options = {}): Promise<Law25Result> {
  const triggers: string[] = [];

  const hasQuebec = QUEBEC_TRIGGER_RE.test(text);
  const hasSubprocessor = US_SUBPROCESSOR_RE.test(text);
  const fired = opts.forceTrigger || (hasQuebec && hasSubprocessor);

  if (!fired) {
    return { triggered: false, triggers: [] };
  }

  triggers.push(LAW25_DEMO_NOTICE);
  if (hasQuebec) triggers.push("Quebec-resident or Quebec-branch data exposure detected.");
  if (hasSubprocessor) {
    triggers.push(
      "US-hosted analytics subprocessor signal detected — cross-border transfer would require Law 25 consent and impact assessment."
    );
  }
  if (opts.forceTrigger && !hasQuebec && !hasSubprocessor) {
    triggers.push(
      "Demo path: forceTrigger=true, no concrete Quebec / subprocessor language detected in the supplied text."
    );
  }

  let pia: PIA | undefined;
  if (opts.generatePia !== false) {
    pia = await buildPIA({ tokens: opts.templateTokens ?? {} });
  }

  return { triggered: true, triggers, pia };
}
