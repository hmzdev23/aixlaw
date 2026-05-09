import { fail, ok, readJson } from "@/lib/engine/_shared/apiHelpers";
import {
  PLAYBOOK_SCHEMA,
  playbookRepository,
} from "@/lib/engine/architect/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const summaries = await playbookRepository.list();
    return ok(summaries);
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await readJson(req, PLAYBOOK_SCHEMA);
    await playbookRepository.save(body);
    const stored = await playbookRepository.get(body.id);
    return ok(stored, { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
