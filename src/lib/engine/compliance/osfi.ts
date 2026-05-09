import type { OsfiResult } from "@/contracts";

/**
 * OSFI Guideline B-13 (third-party risk / operational resilience) THEME engine.
 *
 * NOT a regulatory opinion. We detect scenario-level signals from the contract
 * text using deterministic patterns. If ≥ DEFAULT_MIN_SIGNALS appear,
 * `triggered: true` and we surface the human-readable trigger strings.
 *
 * Tied to the Initech MSA themes in
 * `Example Scenario (Optional)/scenario_context.md` (R03, R04, R09, R10, R11,
 * R12, R13).
 */

const DEFAULT_MIN_SIGNALS = 3;

interface OsfiSignal {
  name: string;
  match: (lower: string) => boolean;
  trigger: string;
}

const ANY = (...needles: string[]) => (s: string) => needles.some((n) => s.includes(n));
const ALL = (...needles: string[]) => (s: string) => needles.every((n) => s.includes(n));

const SIGNALS: OsfiSignal[] = [
  {
    name: "uncapped_section_9",
    match: ALL("section 9", "uncapped"),
    trigger:
      "Uncapped Section 9 (Data Protection) liability — material vendor risk shift consistent with OSFI third-party risk themes.",
  },
  {
    name: "breach_window_24h",
    match: ANY(
      "twenty-four (24) hours",
      "twenty-four 24 hours",
      "24 hours of becoming aware",
      "within 24 hours"
    ),
    trigger:
      "24-hour breach notification window aligned with OSFI third-party operational resilience expectations.",
  },
  {
    name: "data_residency_ontario",
    match: ANY(
      "province of ontario",
      "within the province of ontario",
      "ontario only",
      "shall not transfer, replicate, or back up"
    ),
    trigger:
      "Strict data residency (Ontario only) without cross-border consent path — vendor concentration risk theme.",
  },
  {
    name: "audit_rights",
    match: ALL("audit", "calendar year"),
    trigger:
      "Recurring audit rights (twice per calendar year, 48-hour notice) — third-party assurance theme.",
  },
  {
    name: "step_in_rights",
    match: ANY(
      "step-in",
      "assume direct control of the services",
      "appoint a third party to do so"
    ),
    trigger:
      "Step-in / operational resilience rights — vendor failure mitigation theme.",
  },
  {
    name: "insurance_minimums_cyber",
    match: ANY(
      "$10,000,000",
      "10 000 000",
      "ten million",
      "cyber liability insurance"
    ),
    trigger:
      "$10M cyber liability insurance minimum — vendor financial resilience requirement.",
  },
  {
    name: "iso_27001_or_soc_2",
    match: ANY("iso 27001", "soc 2"),
    trigger:
      "Independent ISO 27001 / SOC 2 certification cadence — third-party assurance evidence requirement.",
  },
  {
    name: "convenience_termination",
    match: ANY(
      "terminate this agreement or any order form for convenience",
      "convenience termination",
      "may terminate this agreement or any order form for convenience"
    ),
    trigger:
      "Client convenience-termination right with no early-termination fee — vendor concentration / continuity risk.",
  },
];

export interface OsfiOptions {
  minSignals?: number;
}

export function runOsfi(text: string, opts: OsfiOptions = {}): OsfiResult {
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
      "OSFI signals are scenario-derived themes (Guideline B-13 third-party risk language). This is a risk assessment, not a regulatory opinion.",
    ],
  };
}

export const OSFI_DISCLAIMER_KEY = "osfi_disclaimer";
export const OSFI_DISCLAIMER_TEXT =
  "Gambit's OSFI surface highlights scenario-derived third-party risk themes (Guideline B-13). It is not a regulatory opinion or legal advice.";
