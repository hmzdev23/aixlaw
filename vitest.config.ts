import { defineConfig } from "vitest/config";
import path from "node:path";

const root = __dirname;

/**
 * Manual alias map mirroring tsconfig.json `paths`.
 *
 * Vite's resolver matches strings as prefixes; **longer prefixes must come
 * first** so e.g. `@/contracts/...` doesn't get eaten by `@/...`.
 *
 * If you add a tsconfig path, also add it here.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    globals: false,
    reporters: ["default"],
    env: {
      // Force fallback paths in unit tests to keep them deterministic and offline.
      GAMBIT_DISABLE_LLM: "true",
    },
  },
  resolve: {
    alias: [
      { find: /^@\/contracts$/, replacement: path.resolve(root, "src/lib/contracts") },
      { find: /^@\/contracts\/(.*)$/, replacement: path.resolve(root, "src/lib/contracts/$1") },
      { find: /^@\/app\/(.*)$/, replacement: path.resolve(root, "src/app/$1") },
      { find: /^@\/(.*)$/, replacement: path.resolve(root, "src/$1") },
    ],
  },
});
