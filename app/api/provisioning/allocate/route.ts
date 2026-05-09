/**
 * POST /api/provisioning/allocate
 * Body: { dealId: string, tier: string, seats: number }
 *
 * Mock SaaS provisioning. Updates `data/mock_saas.json` with the allocation
 * record so the Cockpit (and judges) can see the seat count change. Idempotent
 * by dealId — replaying the same body is safe.
 */

import { fail, ok } from "@/lib/http";
import {
  AllocationSchema,
  allocate,
  getProvisioningSnapshot,
} from "@/lib/execution/provisioning";
import { logger } from "@/lib/util/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return fail("bad_json", "Request body is not valid JSON.", 400);
  }
  const parsed = AllocationSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      "bad_input",
      parsed.error.issues[0]?.message ?? "Invalid allocation.",
      400,
    );
  }
  try {
    const record = await allocate(parsed.data);
    return ok({ record });
  } catch (err) {
    logger.error("provisioning allocate failed", {
      err: (err as Error).message,
    });
    return fail("internal", "Allocation failed.", 500);
  }
}

export async function GET(): Promise<Response> {
  const snap = await getProvisioningSnapshot();
  return ok(snap);
}
