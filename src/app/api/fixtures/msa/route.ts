import { readFile } from "node:fs/promises";
import path from "node:path";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/fixtures/msa — raw Spellbook MSA redlines (read-only demo fixture). */
export async function GET(): Promise<Response> {
  try {
    const fp = path.join(
      process.cwd(),
      "Example Scenario (Optional)",
      "msa_initech_redlines.md",
    );
    const text = await readFile(fp, "utf8");
    return ok({ text });
  } catch {
    return fail("fixture_missing", "Could not read MSA fixture.", 500);
  }
}
