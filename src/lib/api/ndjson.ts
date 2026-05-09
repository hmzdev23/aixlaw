"use client";

export type NdjsonHandler<T> = (line: T) => void;

export async function streamNdjson<T>(
  input: RequestInfo | URL,
  init: RequestInit,
  onLine: NdjsonHandler<T>,
): Promise<void> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Stream request failed (${res.status})`);
  }
  if (!res.body) throw new Error("Stream response had no body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { value, done } = await reader.read();
    if (value) buffer += decoder.decode(value, { stream: true });

    let nextNewline = buffer.indexOf("\n");
    while (nextNewline >= 0) {
      const line = buffer.slice(0, nextNewline).trim();
      buffer = buffer.slice(nextNewline + 1);
      if (line) onLine(JSON.parse(line) as T);
      nextNewline = buffer.indexOf("\n");
    }

    if (done) break;
  }

  const tail = buffer.trim();
  if (tail) onLine(JSON.parse(tail) as T);
}
