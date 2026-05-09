/**
 * Zod schema mirroring the `Decision` type in models.ts.
 * Used by /api/workproduct/decision to validate UI submissions.
 *
 * Keep in sync with models.ts. If you add a field, update both.
 */

import { z } from "zod";
import type { Decision } from "./models";

export const CurrencySchema = z.enum(["CAD", "USD"]);
export const LocaleSchema = z.enum(["en", "fr"]);

export const DecisionFinancialsSchema = z.object({
  currency: CurrencySchema,
  monthlyAmount: z.number().nonnegative(),
  netDays: z.number().int().nonnegative(),
  months: z.number().int().positive(),
  tier: z.string().min(1),
  seats: z.number().int().nonnegative(),
  totalContractCad: z.number().nonnegative().optional(),
});

export const CitationUsedSchema = z.object({
  title: z.string().min(1),
  citation: z.string().min(1),
});

export const DecisionSchema = z.object({
  dealId: z.string().min(1),
  chosenMoveId: z.string().min(1),
  counterpartyId: z.string().min(1),
  summaryLegal: z.string().min(1),
  summaryPlain: z.string().min(1),
  financials: DecisionFinancialsSchema,
  complianceFlags: z.array(z.string()),
  citationsUsed: z.array(CitationUsedSchema),
  generatedRedlineDocxRef: z.string().optional(),
  supervisorPdfRef: z.string().optional(),
  locale: LocaleSchema.optional(),
}) satisfies z.ZodType<Decision>;

export type DecisionInput = z.infer<typeof DecisionSchema>;
