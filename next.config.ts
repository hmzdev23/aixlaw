import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  // Spellbook fixture .md/.docx files live at the repo root under
  // "Example Scenario (Optional)/" and are read at runtime by integrations.
  // We do NOT bundle them; reads happen via Node fs in server code only.
  serverExternalPackages: ["googleapis"],
};

export default config;
