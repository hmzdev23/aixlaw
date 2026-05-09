import { AppHeader } from "@/components/shell/AppHeader";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <footer
        className="py-8 text-center text-sm"
        style={{ color: "var(--color-gray-400)", borderTop: "1px solid var(--color-gray-200)" }}
      >
        Gambit · Built for Spellbook Hackathon 2026 · Dunder AI Inc. demo scenario
      </footer>
    </div>
  );
}
