/**
 * Tiny structured logger. Single line JSON in prod, indented in dev.
 *
 * Avoids pulling pino/winston for hackathon code. Use `logger.info("msg", {meta})`.
 */

type Level = "debug" | "info" | "warn" | "error";

interface LogPayload {
  level: Level;
  msg: string;
  ts: string;
  [k: string]: unknown;
}

function emit(payload: LogPayload): void {
  if (process.env.NODE_ENV === "production") {
    // Single-line JSON for log shippers.
    // eslint-disable-next-line no-console
    console[payload.level === "debug" ? "log" : payload.level](
      JSON.stringify(payload),
    );
    return;
  }
  // Dev: easier to read.
  // eslint-disable-next-line no-console
  console[payload.level === "debug" ? "log" : payload.level](
    `[${payload.level}] ${payload.msg}`,
    Object.keys(payload).length > 3 ? payload : "",
  );
}

function bind(level: Level) {
  return (msg: string, meta?: Record<string, unknown>): void => {
    emit({ level, msg, ts: new Date().toISOString(), ...(meta ?? {}) });
  };
}

export const logger = {
  debug: bind("debug"),
  info: bind("info"),
  warn: bind("warn"),
  error: bind("error"),
};
