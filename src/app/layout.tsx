import type { Metadata } from "next";
import "./globals.css";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { PersonaProvider } from "@/contexts/PersonaContext";

export const metadata: Metadata = {
  title: "Gambit — AI Negotiation Co-Pilot",
  description: "Ghost opponent modelling, game-tree analysis, multi-regime compliance, and full deal execution. Built for Spellbook Hackathon 2026.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <LocaleProvider>
          <PersonaProvider>
            {children}
          </PersonaProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
