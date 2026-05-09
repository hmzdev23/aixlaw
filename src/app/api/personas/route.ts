import { ok } from "@/lib/http";
import { listPersonas } from "@/lib/personas";
import type { PersonasResponse } from "@/lib/contracts";

export const dynamic = "force-static";

export function GET(): Response {
  const body: PersonasResponse = { personas: [...listPersonas()] };
  return ok(body);
}
