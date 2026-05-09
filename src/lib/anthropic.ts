/**
 * Anthropic wrapper. If `ANTHROPIC_API_KEY` is missing, all calls fall through
 * to deterministic canned output so the app never breaks on stage / wifi.
 */

import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

function client(): Anthropic | null {
  if (_client) return _client;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  _client = new Anthropic({ apiKey: key });
  return _client;
}

export interface ChatOpts {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}

/** Single-turn text completion. Returns "" on failure / no key. */
export async function complete(opts: ChatOpts): Promise<string> {
  const c = client();
  if (!c) return "";
  try {
    const res = await c.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: opts.maxTokens ?? 1024,
      temperature: opts.temperature ?? 0.4,
      system: opts.system,
      messages: [{ role: "user", content: opts.user }],
    });
    const block = res.content.find((b) => b.type === "text");
    return block && block.type === "text" ? block.text : "";
  } catch (e) {
    console.warn("[anthropic] complete failed", (e as Error).message);
    return "";
  }
}

export function hasLLM(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}
