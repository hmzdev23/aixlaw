/**
 * Engine-wide error class. Carries an HTTP-friendly status code and a machine code
 * so route handlers can map to consistent JSON responses without leaking internals.
 */

export type EngineErrorCode =
  | "bad_request"
  | "not_found"
  | "validation_failed"
  | "fixture_missing"
  | "llm_unavailable"
  | "internal";

export class EngineError extends Error {
  readonly code: EngineErrorCode;
  readonly status: number;
  readonly cause?: unknown;

  constructor(opts: {
    code: EngineErrorCode;
    message: string;
    status?: number;
    cause?: unknown;
  }) {
    super(opts.message);
    this.name = "EngineError";
    this.code = opts.code;
    this.status = opts.status ?? defaultStatus(opts.code);
    this.cause = opts.cause;
  }
}

function defaultStatus(code: EngineErrorCode): number {
  switch (code) {
    case "bad_request":
      return 400;
    case "not_found":
      return 404;
    case "validation_failed":
      return 422;
    case "fixture_missing":
      return 500;
    case "llm_unavailable":
      return 503;
    case "internal":
    default:
      return 500;
  }
}

export function toApiError(err: unknown): {
  status: number;
  body: { ok: false; error: { code: EngineErrorCode; message: string } };
} {
  if (err instanceof EngineError) {
    return {
      status: err.status,
      body: { ok: false, error: { code: err.code, message: err.message } },
    };
  }
  const message = err instanceof Error ? err.message : "Unknown engine error";
  return {
    status: 500,
    body: { ok: false, error: { code: "internal", message } },
  };
}
