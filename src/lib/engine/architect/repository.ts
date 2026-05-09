import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import type {
  AgentBlock,
  AgentBlockType,
  Playbook,
  PlaybookEdge,
  PlaybookRepository,
  PlaybookSummary,
} from "@/contracts";
import { EngineError } from "../_shared/errors";
import { repoRoot } from "../_shared/paths";

/**
 * Filesystem-backed PlaybookRepository with in-memory fallback for read-only
 * environments (e.g. Vercel serverless). The default playbook is always
 * available — it ships in `src/lib/fixtures/playbook_default.json` and is
 * served from memory if the data dir is unwritable.
 */

const AGENT_BLOCK_TYPES = [
  "spellbook_issue_detector",
  "ghost",
  "tree",
  "counsel",
  "closer",
  "counterpart",
  "compliance",
  "crown",
  "truesight",
  "osfi_vendor_management",
  "pipeda_watcher",
  "law25",
  "translator",
  "slack_notifier",
  "gmail_drafter",
  "stripe_webhook",
  "provisioning_webhook",
  "notary_router",
  "supervisor_pdf",
] as const satisfies readonly AgentBlockType[];

const AgentBlockSchema: z.ZodType<AgentBlock> = z.object({
  id: z.string().min(1),
  type: z.enum(AGENT_BLOCK_TYPES),
  position: z.object({ x: z.number(), y: z.number() }),
  params: z.record(
    z.string(),
    z.union([z.number(), z.string(), z.boolean()])
  ),
});

const PlaybookEdgeSchema: z.ZodType<PlaybookEdge> = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
});

const PlaybookSchema: z.ZodType<Playbook> = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  blocks: z.array(AgentBlockSchema).min(1),
  edges: z.array(PlaybookEdgeSchema),
  createdBy: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const PLAYBOOK_SCHEMA = PlaybookSchema;

const FIXTURE_DEFAULT = path.join(
  repoRoot(),
  "src/lib/fixtures/playbook_default.json"
);

function defaultDataDir(): string {
  const override = process.env.GAMBIT_PLAYBOOKS_DIR?.trim();
  if (override) return override;
  return path.join(repoRoot(), "data/playbooks");
}

let memoryStore: Map<string, Playbook> | undefined;
let writableDirCached: string | null | undefined;

async function ensureWritable(): Promise<string | null> {
  if (writableDirCached !== undefined) return writableDirCached;
  const dir = defaultDataDir();
  try {
    await fs.mkdir(dir, { recursive: true });
    // touch a probe file
    const probe = path.join(dir, ".write-probe");
    await fs.writeFile(probe, String(Date.now()));
    await fs.unlink(probe);
    writableDirCached = dir;
  } catch {
    writableDirCached = null;
  }
  return writableDirCached;
}

async function loadDefault(): Promise<Playbook> {
  const raw = await fs.readFile(FIXTURE_DEFAULT, "utf8");
  const parsed = PlaybookSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new EngineError({
      code: "validation_failed",
      message: `playbook_default.json failed schema: ${parsed.error.message}`,
    });
  }
  return parsed.data;
}

async function readMemoryStore(): Promise<Map<string, Playbook>> {
  if (memoryStore) return memoryStore;
  memoryStore = new Map<string, Playbook>();
  memoryStore.set("pb_default", await loadDefault());
  return memoryStore;
}

class FilesystemPlaybookRepository implements PlaybookRepository {
  async list(): Promise<PlaybookSummary[]> {
    const dir = await ensureWritable();
    const summaries: PlaybookSummary[] = [];
    const seen = new Set<string>();

    if (dir) {
      let files: string[] = [];
      try {
        files = await fs.readdir(dir);
      } catch {
        files = [];
      }
      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        try {
          const raw = await fs.readFile(path.join(dir, file), "utf8");
          const parsed = PlaybookSchema.safeParse(JSON.parse(raw));
          if (!parsed.success) continue;
          const pb = parsed.data;
          summaries.push({
            id: pb.id,
            name: pb.name,
            version: pb.version,
            updatedAt: pb.updatedAt,
          });
          seen.add(pb.id);
        } catch {
          // skip unreadable files; this is hackathon-grade dev storage.
        }
      }
    }

    const memory = await readMemoryStore();
    for (const pb of memory.values()) {
      if (seen.has(pb.id)) continue;
      summaries.push({
        id: pb.id,
        name: pb.name,
        version: pb.version,
        updatedAt: pb.updatedAt,
      });
    }
    summaries.sort((a, b) => a.name.localeCompare(b.name));
    return summaries;
  }

  async get(id: string): Promise<Playbook> {
    if (!id) {
      throw new EngineError({ code: "bad_request", message: "id is required" });
    }
    const dir = await ensureWritable();
    if (dir) {
      const filePath = path.join(dir, `${id}.json`);
      try {
        const raw = await fs.readFile(filePath, "utf8");
        const parsed = PlaybookSchema.safeParse(JSON.parse(raw));
        if (parsed.success) return parsed.data;
      } catch {
        // fall through to memory
      }
    }
    const memory = await readMemoryStore();
    const hit = memory.get(id);
    if (!hit) {
      throw new EngineError({
        code: "not_found",
        message: `Playbook not found: ${id}`,
      });
    }
    return hit;
  }

  async save(playbook: Playbook): Promise<void> {
    const parsed = PlaybookSchema.safeParse(playbook);
    if (!parsed.success) {
      throw new EngineError({
        code: "validation_failed",
        message: `playbook failed schema: ${parsed.error.message}`,
      });
    }
    const stamped: Playbook = { ...parsed.data, updatedAt: new Date().toISOString() };
    const memory = await readMemoryStore();
    memory.set(stamped.id, stamped);
    const dir = await ensureWritable();
    if (dir) {
      const filePath = path.join(dir, `${stamped.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(stamped, null, 2), "utf8");
    }
  }
}

export const playbookRepository: PlaybookRepository =
  new FilesystemPlaybookRepository();

export function __resetPlaybookStorageForTests(): void {
  memoryStore = undefined;
  writableDirCached = undefined;
}
