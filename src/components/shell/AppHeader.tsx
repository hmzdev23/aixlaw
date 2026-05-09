"use client";

import Link from "next/link";
import { ModeTabs } from "./ModeTabs";
import { LocaleToggle } from "./LocaleToggle";
import { PersonaSwitcher } from "./PersonaSwitcher";
import { usePathname } from "next/navigation";

export function AppHeader() {
  const pathname = usePathname();
  const isMarketing = pathname === "/";

  return (
    <header
      className="sticky top-0 z-50 flex items-center h-16 px-6 gap-4"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 shrink-0 font-bold text-lg tracking-tight"
        style={{ color: "var(--color-gray-900)", letterSpacing: "-0.04em" }}
        aria-label="Gambit — home"
      >
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold"
          style={{ background: "linear-gradient(135deg, #FF4B00, #FF7A40)" }}
          aria-hidden="true"
        >
          G
        </span>
        <span className="hidden sm:inline">Gambit</span>
      </Link>

      {/* Mode tabs — only show in app routes */}
      {!isMarketing && (
        <div className="flex-1 flex justify-center">
          <ModeTabs />
        </div>
      )}

      {isMarketing && <div className="flex-1" />}

      {/* Right controls */}
      <div className="flex items-center gap-2 shrink-0">
        <LocaleToggle />
        <PersonaSwitcher />
        {isMarketing && (
          <Link
            href="/cockpit"
            className="hidden sm:flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #FF4B00, #FF7A40)",
              boxShadow: "0 4px 16px rgba(255,75,0,0.3)",
            }}
          >
            Enter Cockpit
          </Link>
        )}
      </div>
    </header>
  );
}
