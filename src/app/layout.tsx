import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { PersonaProvider } from "@/contexts/PersonaContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gambit — AI Negotiation Co-Pilot",
  description: "Ghost opponent modelling, game-tree analysis, multi-regime compliance, and full deal execution. Built for Spellbook Hackathon 2026.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full`}>
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
