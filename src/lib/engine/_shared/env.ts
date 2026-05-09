/**
 * Centralized env access for the engine. Avoids `process.env.X` reads scattered everywhere
 * and makes test overrides obvious.
 */

function bool(value: string | undefined, def = false): boolean {
  if (value === undefined) return def;
  const v = value.trim().toLowerCase();
  if (v === "1" || v === "true" || v === "yes" || v === "on") return true;
  if (v === "0" || v === "false" || v === "no" || v === "off") return false;
  return def;
}

export const env = {
  get anthropicKey(): string | undefined {
    return process.env.ANTHROPIC_API_KEY?.trim() || undefined;
  },
  get model(): string {
    return process.env.GAMBIT_ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-5";
  },
  /**
   * `true` => engine never calls Claude, always uses canned fallback.
   * Auto-true when no API key is present so tests/CI/demos never hard-fail.
   */
  get llmDisabled(): boolean {
    if (bool(process.env.GAMBIT_DISABLE_LLM, false)) return true;
    return !this.anthropicKey;
  },
  get debug(): boolean {
    return bool(process.env.GAMBIT_DEBUG, false);
  },
};
