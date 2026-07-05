"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Profile } from "@/lib/types";
import { NAV_ITEMS, isNavItemActive } from "./nav";

/** Desktop-Sidebar (ab md): Navigation links, unten das eingeloggte Profil. */
export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const initial = profile.display_name.charAt(0).toUpperCase();

  return (
    <aside className="glass fixed inset-y-0 left-0 z-30 hidden w-64 flex-col md:flex">
      <div className="px-6 pt-8 pb-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Wohnungsplanung
        </Link>
      </div>

      <nav aria-label="Hauptnavigation" className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              <item.icon
                className="size-5 shrink-0"
                strokeWidth={active ? 2.25 : 2}
                aria-hidden
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line px-4 py-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent ring-2 ring-accent"
          >
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {profile.display_name}
            </p>
            <p className="truncate text-xs text-muted">Angemeldet</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
