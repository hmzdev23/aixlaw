import { NextResponse } from "next/server";
import type { z } from "zod";
import { EngineError, toApiError } from "./errors";

/**
 * Helpers for the engine API route handlers. Keep handlers tiny and consistent.
 */

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ ok: true, data }, { status: 200, ...init });
}

export function fail(err: unknown): NextResponse {
  const mapped = toApiError(err);
  return NextResponse.json(mapped.body, { status: mapped.status });
}

export async function readJson<T>(
  req: Request,
  schema: z.ZodType<T>
): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new EngineError({
      code: "bad_request",
      message: "Request body must be valid JSON",
    });
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new EngineError({
      code: "validation_failed",
      message: parsed.error.message,
    });
  }
  return parsed.data;
}

export function requireSearchParam(
  req: Request,
  key: string
): string {
  const url = new URL(req.url);
  const v = url.searchParams.get(key);
  if (!v) {
    throw new EngineError({
      code: "bad_request",
      message: `Missing required query parameter: ${key}`,
    });
  }
  return v;
}
