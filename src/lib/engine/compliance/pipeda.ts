import type { PipedaResult } from "@/contracts";

/**
 * PIPEDA (Personal Information Protection and Electronic Documents Act)
 * accountability / cross-border / retention pattern engine.
 *
 * Same shape as OSFI: pattern-detect ≥ 1 signal => triggered. We surface
 * human-readable triggers tied to the contract text.
 */

const DEFAULT_MIN_SIGNALS = 1;

interface PipedaSignal {
  name: string;
  match: (lower: string) => boolean;
  trigger: string;
}

const ANY = (...needles: string[]) => (s: string) => needles.some((n) => s.includes(n));

const SIGNALS: PipedaSignal[] = [
  {
    name: "cross_border_transfer",
    match: ANY(
      "cross-border data transfers",
      "cross-border data transfer",
      "cross-border subprocessors",
      "u.s.-based subprocessors",
      "us-based subprocessors",
      "outside of canada",
      "outside canada"
    ),
    trigger:
      "Cross-border data transfer language present — accountability transfer responsibilities under PIPEDA Principle 1.",
  },
  {
    name: "iso_or_soc_evidence",
    match: ANY("iso 27001", "soc 2"),
    trigger:
      "Independent security certification (ISO 27001 / SOC 2) referenced — supports PIPEDA Principle 7 (Safeguards).",
  },
  {
    name: "breach_notification",
    match: ANY(
      "twenty-four (24) hours",
      "within 24 hours",
      "notify client promptly",
      "promptly notify client"
    ),
    trigger:
      "Mandatory breach notification window present — supports PIPEDA breach-of-security-safeguards reporting baseline.",
  },
  {
    name: "retention_terms",
    match: ANY(
      "make client data available for export",
      "retain one archival copy",
      "retain one (1) archival copy",
      "no archival copies"
    ),
    trigger:
      "Data retention / disposal terms present — touches PIPEDA Principle 5 (Limiting Use, Disclosure, and Retention).",
  },
  {
    name: "subprocessor_obligations",
    match: ANY(
      "vendor's representatives",
      "subprocessor",
      "third-party processor",
      "subcontractor"
    ),
    trigger:
      "Sub-processor / contractor language present — accountability flow-down obligations under PIPEDA Principle 1.",
  },
];

export interface PipedaOptions {
  minSignals?: number;
}

export function runPipeda(text: string, opts: PipedaOptions = {}): PipedaResult {
  const minSignals = opts.minSignals ?? DEFAULT_MIN_SIGNALS;
  if (!text) return { triggered: false, triggers: [], notes: ["empty input"] };
  const lower = text.toLowerCase();

  const triggers: string[] = [];
  for (const sig of SIGNALS) {
    if (sig.match(lower)) triggers.push(sig.trigger);
  }
  return {
    triggered: triggers.length >= minSignals,
    triggers,
    notes: [
      "PIPEDA signals reflect plain-language pattern detection on the contract text. Always confirm with counsel.",
    ],
  };
}

export const PIPEDA_DISCLAIMER_TEXT =
  "Gambit's PIPEDA surface flags accountability / safeguards / retention themes from contract language. Not legal advice.";
