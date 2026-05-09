import type { z } from "zod";
import { env } from "./env";
import { EngineError } from "./errors";

/**
 * Thin wrapper around the Anthropic Messages API for structured JSON output.
 *
 * Strategy:
 *   1. Call with a strict system prompt + user message that includes the
 *      target JSON shape.
 *   2. Try to parse the response; on parse failure send one "fix this" retry
 *      that includes the original output and the Zod error.
 *   3. If still bad — or if no API key is configured — throw EngineError;
 *      callers must already have a fallback path.
 */

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

interface JsonChatOptions {
  system: string;
  messages: AnthropicMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface AnthropicTextBlock {
  type: "text";
  text: string;
}

interface AnthropicResponse {
  content: AnthropicTextBlock[];
}

let cachedClient: unknown;

async function getClient(): Promise<{
  messages: {
    create: (params: {
      model: string;
      max_tokens: number;
      temperature?: number;
      system: string;
      messages: AnthropicMessage[];
    }) => Promise<AnthropicResponse>;
  };
}> {
  if (!env.anthropicKey) {
    throw new EngineError({
      code: "llm_unavailable",
      message: "ANTHROPIC_API_KEY is not configured",
    });
  }
  if (cachedClient) {
    return cachedClient as Awaited<ReturnType<typeof getClient>>;
  }
  const mod = await import("@anthropic-ai/sdk");
  const Anthropic = mod.default;
  cachedClient = new Anthropic({ apiKey: env.anthropicKey });
  return cachedClient as Awaited<ReturnType<typeof getClient>>;
}

function extractJsonBlock(raw: string): string {
  // Accepts either pure JSON or fenced ```json ... ``` blocks.
  const fenced = raw.match(/```json\s*([\s\S]+?)\s*```/i);
  if (fenced) return fenced[1].trim();
  const generic = raw.match(/```\s*([\s\S]+?)\s*```/);
  if (generic) return generic[1].trim();
  return raw.trim();
}

export async function jsonChat<T>(
  schema: z.ZodType<T>,
  options: JsonChatOptions
): Promise<T> {
  if (env.llmDisabled) {
    throw new EngineError({
      code: "llm_unavailable",
      message: "LLM disabled (GAMBIT_DISABLE_LLM=true or no ANTHROPIC_API_KEY)",
    });
  }

  const client = await getClient();
  const model = options.model ?? env.model;
  const maxTokens = options.maxTokens ?? 1500;

  const first = await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature: options.temperature ?? 0,
    system: options.system,
    messages: options.messages,
  });

  const firstText = first.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const firstParsed = tryParse(schema, firstText);
  if (firstParsed.ok) return firstParsed.data;

  // Retry once with the model's own output and the Zod error.
  const retry = await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature: 0,
    system: options.system,
    messages: [
      ...options.messages,
      { role: "assistant", content: firstText },
      {
        role: "user",
        content: `Your previous response did not parse against the required JSON schema. Schema error: ${firstParsed.error}. Return ONLY a valid JSON object (no commentary, no markdown fences) that matches the schema exactly.`,
      },
    ],
  });

  const retryText = retry.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  const retryParsed = tryParse(schema, retryText);
  if (retryParsed.ok) return retryParsed.data;

  throw new EngineError({
    code: "validation_failed",
    message: `Claude output failed schema after retry: ${retryParsed.error}`,
  });
}

function tryParse<T>(
  schema: z.ZodType<T>,
  raw: string
):
  | { ok: true; data: T }
  | { ok: false; error: string } {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(extractJsonBlock(raw));
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "json parse failed" };
  }
  const parsed = schema.safeParse(parsedJson);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.message };
  }
  return { ok: true, data: parsed.data };
}

/** Test only. */
export function __resetAnthropicForTests(): void {
  cachedClient = undefined;
}
