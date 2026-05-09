import { fail, ok } from "@/lib/engine/_shared/apiHelpers";
import { playbookRepository } from "@/lib/engine/architect/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const pb = await playbookRepository.get(id);
    return ok(pb);
  } catch (e) {
    return fail(e);
  }
}
