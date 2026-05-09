/**
 * Notary queue persistence. Server-only.
 *
 * docs/tasks/09 §Notary queue: append a job to `data/notary_queue.jsonl`.
 *
 * Format: one JSON object per line. JSONL keeps the file safely streamable
 * + appendable without locking the whole file.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { logger } from "@/lib/util/logger";

const QUEUE_PATH = () =>
  path.join(process.cwd(), "data", "notary_queue.jsonl");

export interface NotaryJob {
  jobId: string;
  dealId: string;
  jurisdiction: "QC";
  contact: string;
  status: "queued" | "in_progress" | "complete";
  createdAt: string;
}

export interface EnqueueInput {
  dealId: string;
  contact?: string;
}

export async function enqueueNotaryJob(
  input: EnqueueInput,
): Promise<NotaryJob> {
  const job: NotaryJob = {
    jobId: `notary_${Date.now()}_${Math.floor(Math.random() * 1e6).toString(36)}`,
    dealId: input.dealId,
    jurisdiction: "QC",
    contact: input.contact ?? "registry-qc@gambit.demo",
    status: "queued",
    createdAt: new Date().toISOString(),
  };
  const line = JSON.stringify(job);
  const file = QUEUE_PATH();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.appendFile(file, `${line}\n`, "utf-8");
  return job;
}

export async function listNotaryJobs(): Promise<NotaryJob[]> {
  const file = QUEUE_PATH();
  let raw: string;
  try {
    raw = await fs.readFile(file, "utf-8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  const out: NotaryJob[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      out.push(JSON.parse(trimmed) as NotaryJob);
    } catch (err) {
      logger.warn("notary queue: skipped corrupt line", {
        err: (err as Error).message,
      });
    }
  }
  return out;
}
