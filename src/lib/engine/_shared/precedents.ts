import { promises as fs } from "node:fs";
import { z } from "zod";
import { EngineError } from "./errors";
import { precedentPath } from "./paths";

/**
 * Synthetic Initech vendor precedent corpus (T4-authored).
 *
 * The shape is documented in `Example Scenario (Optional)/precedents/README.md`.
 * The Zod schema is the runtime contract — if a JSON drifts the engine fails loudly
 * at boot rather than producing junk.
 */

export const PrecedentClauseSchema = z.object({
  ref: z.string().min(1),
  topic: z.string().min(1),
  text: z.string().min(20),
});

export const PrecedentSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  year: z.number().int(),
  vendorType: z.string().min(1),
  outcome: z.enum(["signed", "walked"]),
  summary: z.string().min(10),
  clauses: z.array(PrecedentClauseSchema).min(3),
});

export type PrecedentClause = z.infer<typeof PrecedentClauseSchema>;
export type Precedent = z.infer<typeof PrecedentSchema>;

const DEFAULT_PRECEDENT_FILES = [
  "initech_vendor_a.json",
  "initech_vendor_b.json",
  "initech_vendor_c.json",
] as const;

let cached: Precedent[] | undefined;

export async function loadPrecedents(
  files: readonly string[] = DEFAULT_PRECEDENT_FILES
): Promise<Precedent[]> {
  if (cached) return cached;

  const out: Precedent[] = [];
  for (const file of files) {
    let raw: string;
    try {
      raw = await fs.readFile(precedentPath(file), "utf8");
    } catch (e) {
      throw new EngineError({
        code: "fixture_missing",
        message: `Precedent file not found: ${file}`,
        cause: e,
      });
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw);
    } catch (e) {
      throw new EngineError({
        code: "fixture_missing",
        message: `Precedent ${file} is not valid JSON`,
        cause: e,
      });
    }

    const parsed = PrecedentSchema.safeParse(parsedJson);
    if (!parsed.success) {
      throw new EngineError({
        code: "validation_failed",
        message: `Precedent ${file} failed schema: ${parsed.error.message}`,
      });
    }
    out.push(parsed.data);
  }

  cached = out;
  return cached;
}

/** Test/dev only — clear the in-memory cache. */
export function __resetPrecedentCacheForTests(): void {
  cached = undefined;
}
