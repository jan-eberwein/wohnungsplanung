"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavItemActive } from "./nav";

/**
 * Mobile Tab-Bar: fixiert am unteren Rand, 6 Tabs, safe-area-fest.
 * Aktiv/Inaktiv unterscheiden sich nur über Farbe + absolut positionierten
 * Punkt-Indikator — dadurch kein Layout-Shift beim Tab-Wechsel.
 */
export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hauptnavigation"
      className="glass-strong fixed inset-x-0 bottom-0 z-40 pb-safe md:hidden"
    >
      <div className="grid h-[72px] grid-cols-6">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-11 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                active ? "text-accent" : "text-muted"
              }`}
            >
              <span
                aria-hidden
                className={`absolute top-1.5 size-1 rounded-full bg-accent transition-opacity ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />
              <item.icon
                className="size-6"
                strokeWidth={active ? 2.25 : 1.75}
                aria-hidden
              />
              <span>{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
