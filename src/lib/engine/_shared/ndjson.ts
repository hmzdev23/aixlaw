/**
 * Helpers for streaming AsyncIterables as NDJSON over `Response`.
 *
 * NDJSON = newline-delimited JSON: each chunk is one JSON value followed by `\n`.
 * Easier to parse client-side than SSE and avoids special framing.
 */

const encoder = new TextEncoder();

export function asyncIterableToNdjson<T>(iter: AsyncIterable<T>): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        for await (const item of iter) {
          controller.enqueue(encoder.encode(JSON.stringify(item) + "\n"));
        }
        controller.close();
      } catch (e) {
        const message = e instanceof Error ? e.message : "stream failure";
        controller.enqueue(
          encoder.encode(JSON.stringify({ kind: "error", error: { message } }) + "\n")
        );
        controller.close();
      }
    },
  });
}

export const NDJSON_HEADERS = {
  "content-type": "application/x-ndjson; charset=utf-8",
  "cache-control": "no-store",
} satisfies HeadersInit;

/** Test helper: collect all NDJSON lines from a Response body into an array. */
export async function collectNdjson<T = unknown>(res: Response): Promise<T[]> {
  if (!res.body) return [];
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const out: T[] = [];
  for (;;) {
    const { value, done } = await reader.read();
    if (value) buffer += decoder.decode(value, { stream: true });
    if (done) break;
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      out.push(JSON.parse(line) as T);
    }
  }
  buffer = buffer.trim();
  if (buffer) out.push(JSON.parse(buffer) as T);
  return out;
}
