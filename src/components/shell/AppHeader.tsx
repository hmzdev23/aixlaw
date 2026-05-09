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
    <header className="sticky top-0 z-50 flex items-center h-14 px-6 gap-4 bg-white border-b border-zinc-200">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 shrink-0 font-bold text-lg tracking-tight text-zinc-900"
        style={{ letterSpacing: "-0.04em" }}
        aria-label="Gambit — home"
      >
        <span
          className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-sm font-bold"
          style={{ background: "#FF4B00" }}
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
            className="hidden sm:flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white bg-zinc-950 transition-transform hover:-translate-y-0.5"
          >
            Enter Cockpit
          </Link>
        )}
      </div>
    </header>
  );
}
