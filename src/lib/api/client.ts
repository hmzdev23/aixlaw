/**
 * Typed JSON helpers for same-origin Gambit API routes.
 * Engine + app routes both use `{ ok: true, data } | { ok: false, error }`.
 */

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type OkEnvelope<T> = { ok: true; data: T };
type FailEnvelope = { ok: false; error: { code: string; message: string } };

export async function readApiJson<T>(res: Response): Promise<T> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new ApiClientError("Response was not JSON", res.status);
  }
  const b = body as Partial<OkEnvelope<T>> & Partial<FailEnvelope>;
  if (!res.ok || b.ok === false) {
    const msg = b.ok === false ? b.error?.message : `HTTP ${res.status}`;
    const code = b.ok === false ? b.error?.code : undefined;
    throw new ApiClientError(msg ?? "Request failed", res.status, code);
  }
  if (b.ok === true && "data" in b) {
    return b.data as T;
  }
  throw new ApiClientError("Malformed API envelope", res.status);
}

export async function apiPostJson<T>(path: string, json: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  });
  return readApiJson<T>(res);
}

export async function apiGetJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { method: "GET" });
  return readApiJson<T>(res);
}
