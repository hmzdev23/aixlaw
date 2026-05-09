/**
 * GET /api/notary/queue
 *
 * Returns the current contents of `data/notary_queue.jsonl`. Used by the
 * Cockpit to render "Notary queue: 1 job" after the execution pipeline runs.
 */

import { ok } from "@/lib/http";
import { listNotaryJobs } from "@/lib/execution/notaryQueue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const jobs = await listNotaryJobs();
  return ok({ jobs, count: jobs.length });
}
