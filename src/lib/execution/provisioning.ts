/**
 * Mock SaaS provisioning store. Server-only.
 *
 * docs/tasks/09 §Provisioning webhook:
 *   - POST /api/provisioning/allocate updates `data/mock_saas.json`.
 *   - Demo allocates 50 Enterprise seats per deal.
 *
 * Writes are serialized through an in-process queue so concurrent allocate
 * calls don't lose updates. (Vercel lambdas serialize per request anyway,
 * but `next dev` can interleave.)
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";

const FILE = () => path.join(process.cwd(), "data", "mock_saas.json");

export const AllocationSchema = z.object({
  dealId: z.string().min(1),
  tier: z.string().min(1),
  seats: z.number().int().nonnegative(),
});

export type AllocationInput = z.infer<typeof AllocationSchema>;

export interface ProvisioningRecord {
  dealId: string;
  tier: string;
  seats: number;
  allocatedAt: string;
}

export interface ProvisioningSnapshot {
  totalSeats: number;
  records: ProvisioningRecord[];
  updatedAt: string;
}

const EMPTY: ProvisioningSnapshot = {
  totalSeats: 0,
  records: [],
  updatedAt: new Date(0).toISOString(),
};

let writeQueue: Promise<unknown> = Promise.resolve();

async function readSnapshot(): Promise<ProvisioningSnapshot> {
  try {
    const raw = await fs.readFile(FILE(), "utf-8");
    const parsed = JSON.parse(raw) as ProvisioningSnapshot;
    return parsed.records ? parsed : EMPTY;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { ...EMPTY };
    throw err;
  }
}

async function writeSnapshot(snap: ProvisioningSnapshot): Promise<void> {
  const file = FILE();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(snap, null, 2), "utf-8");
}

export async function allocate(
  input: AllocationInput,
): Promise<ProvisioningRecord> {
  // Serialize writes — last-writer-wins becomes deterministic.
  const next = writeQueue.then(async () => {
    const snap = await readSnapshot();
    // Idempotency: if this dealId already has a record, replace (latest wins).
    const filtered = snap.records.filter((r) => r.dealId !== input.dealId);
    const record: ProvisioningRecord = {
      dealId: input.dealId,
      tier: input.tier,
      seats: input.seats,
      allocatedAt: new Date().toISOString(),
    };
    const newRecords = [...filtered, record];
    const updated: ProvisioningSnapshot = {
      totalSeats: newRecords.reduce((acc, r) => acc + r.seats, 0),
      records: newRecords,
      updatedAt: record.allocatedAt,
    };
    await writeSnapshot(updated);
    return record;
  });
  writeQueue = next.catch(() => undefined);
  return next;
}

export async function getProvisioningSnapshot(): Promise<ProvisioningSnapshot> {
  await writeQueue;
  return readSnapshot();
}
