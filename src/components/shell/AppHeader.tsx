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
    <header className="sticky top-0 z-50 flex items-center h-16 px-6 gap-4 bg-[#f5f5f5] border-b border-[#e7e5e4]">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 shrink-0"
        aria-label="Gambit — home"
      >
        <div className="h-9 w-9 rounded-xl border border-[#e7e5e4] bg-white shadow-sm flex items-center justify-center" aria-hidden="true">
          <div className="grid h-5 w-5 grid-cols-2 gap-0.5">
            <div className="rounded-sm bg-[#0c0a09]" />
            <div className="rounded-sm bg-[#a7e5d3]" />
            <div className="rounded-sm bg-[#a8c8e8]" />
            <div className="rounded-sm bg-[#c8b8e0]" />
          </div>
        </div>
        <span className="hidden sm:inline text-[#0c0a09] text-[15px] font-medium">Gambit</span>
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
            className="hidden sm:flex items-center px-4 py-2 rounded-full text-[15px] font-medium text-white bg-[#0c0a09] hover:bg-[#292524] transition-colors"
          >
            Enter Cockpit
          </Link>
        )}
      </div>
    </header>
  );
}
