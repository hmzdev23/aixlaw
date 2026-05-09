import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { Decision } from "@/contracts";
import { EngineError } from "../_shared/errors";
import { repoRoot } from "../_shared/paths";

const DecisionSchema: z.ZodType<Decision> = z.object({
  dealId: z.string(),
  chosenMoveId: z.string(),
  counterpartyId: z.string(),
  summaryLegal: z.string(),
  summaryPlain: z.string(),
  financials: z.object({
    currency: z.union([z.literal("CAD"), z.literal("USD")]),
    monthlyAmount: z.number(),
    netDays: z.number(),
    months: z.number(),
    tier: z.string(),
    seats: z.number(),
    totalContractCad: z.number().optional(),
  }),
  complianceFlags: z.array(z.string()),
  citationsUsed: z.array(
    z.object({ title: z.string(), citation: z.string() })
  ),
  generatedRedlineDocxRef: z.string().optional(),
  supervisorPdfRef: z.string().optional(),
});

let cached: Decision | undefined;

function loadSync(): Decision | undefined {
  return cached;
}

async function load(): Promise<Decision> {
  if (cached) return cached;
  const file = path.join(repoRoot(), "src/lib/fixtures/decision_canned.json");
  let raw: string;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch (e) {
    throw new EngineError({
      code: "fixture_missing",
      message: "decision_canned.json missing",
      cause: e,
    });
  }
  const parsed = DecisionSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new EngineError({
      code: "validation_failed",
      message: `decision_canned.json failed schema: ${parsed.error.message}`,
    });
  }
  cached = parsed.data;
  return cached;
}

/** Synchronous accessor that throws if `load()` hasn't run. */
export function decision_canned(): Decision {
  const v = loadSync();
  if (!v) {
    throw new EngineError({
      code: "internal",
      message: "Canned decision not loaded; call ensureCannedDecisionLoaded() first",
    });
  }
  return JSON.parse(JSON.stringify(v)) as Decision;
}

export async function ensureCannedDecisionLoaded(): Promise<void> {
  await load();
}

export function __resetCannedDecisionForTests(): void {
  cached = undefined;
}
