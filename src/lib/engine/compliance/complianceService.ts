import type {
  ComplianceReport,
  ComplianceService,
  Law25Result,
  OsfiResult,
  PipedaResult,
  TrueSightResult,
} from "@/contracts";
import { runLaw25 } from "./law25";
import { runOsfi } from "./osfi";
import { runPipeda } from "./pipeda";
import { runTrueSight, type ExtractedCitation } from "./trueSight";

/**
 * The real T6 implementation. Aggregates the four sub-engines into a single
 * ComplianceReport. Extends the public report with a non-typed `extracted`
 * field on TrueSight (UI spans) — consumers that need it cast at the boundary;
 * the canonical `ComplianceReport` shape is preserved.
 */

export interface CheckOptions {
  /**
   * When provided, enables demo-only behavior such as the TrueSight inject
   * path and partyQuebec-style flag derivation.
   */
  dealId?: string;
  /** Caller can force Law 25 (used by the notary endpoint for the demo). */
  forceLaw25?: boolean;
  /** PIA template tokens (e.g. vendor_displayName). */
  piaTokens?: Record<string, string>;
}

export class RealComplianceService implements ComplianceService {
  async checkProposedText(
    text: string,
    locale: "en" | "fr"
  ): Promise<ComplianceReport> {
    const ex = await this.checkProposedTextEx(text, locale, {});
    // Strip the T6-internal `_extracted` field so the public ComplianceService
    // contract stays clean — only the four canonical keys.
    const { _extracted: _strip, ...clean } = ex;
    void _strip;
    return clean;
  }

  /**
   * Extended variant exposed for the notary endpoint and the live API route.
   * The route handler can attach demo-id and PIA tokens that the public
   * ComplianceService interface doesn't carry.
   */
  async checkProposedTextEx(
    text: string,
    _locale: "en" | "fr",
    opts: CheckOptions
  ): Promise<ComplianceReport & { _extracted?: ExtractedCitation[] }> {
    void _locale; // locale presently affects PIA presentation only (always EN+FR)

    const [trueSight, osfi, pipeda, law25] = await Promise.all([
      runTrueSight(text ?? "", { dealId: opts.dealId }),
      Promise.resolve(runOsfi(text ?? "")),
      Promise.resolve(runPipeda(text ?? "")),
      runLaw25(text ?? "", {
        forceTrigger: opts.forceLaw25,
        templateTokens: opts.piaTokens,
      }),
    ]);

    const cleanTrueSight: TrueSightResult = {
      status: trueSight.status,
      claims: trueSight.claims,
    };

    const cleanOsfi: OsfiResult = osfi;
    const cleanPipeda: PipedaResult = pipeda;
    const cleanLaw25: Law25Result = law25;

    return {
      trueSight: cleanTrueSight,
      osfi: cleanOsfi,
      pipeda: cleanPipeda,
      law25: cleanLaw25,
      _extracted: trueSight.extracted,
    };
  }
}

export const realComplianceService = new RealComplianceService();
