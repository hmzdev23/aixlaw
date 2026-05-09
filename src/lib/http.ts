/**
 * Tiny HTTP helpers for App Router routes. Server-only.
 */

import { NextResponse } from "next/server";
import type { ApiError, Result } from "@/lib/contracts";

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json<Result<T>>({ ok: true, data }, init);
}

export function fail(
  code: string,
  message: string,
  status = 400,
): NextResponse {
  const body: { ok: false; error: ApiError } = {
    ok: false,
    error: { code, message },
  };
  return NextResponse.json(body, { status });
}

export function methodNotAllowed(allow: string[]): NextResponse {
  return new NextResponse("Method Not Allowed", {
    status: 405,
    headers: { Allow: allow.join(", ") },
  });
}
