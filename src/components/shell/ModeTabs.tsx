"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/contexts/LocaleContext";
import { LayoutDashboard, Swords, Network } from "lucide-react";

const MODES = [
  { href: "/cockpit", icon: LayoutDashboard, key: "cockpit" as const },
  { href: "/war-room", icon: Swords, key: "warRoom" as const },
  { href: "/architect", icon: Network, key: "architect" as const },
] as const;

export function ModeTabs() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="flex items-center gap-1" aria-label="Application modes">
      {MODES.map(({ href, icon: Icon, key }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150"
            style={{
              background: active ? "var(--color-brand-muted)" : "transparent",
              color: active ? "var(--color-brand)" : "var(--color-gray-600)",
              fontWeight: active ? 600 : 450,
            }}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={14} />
            <span className="hidden md:inline">{t.modes[key]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
