"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PackageOpen, Search, TriangleAlert } from "lucide-react";
import type { PantryItem } from "@/lib/types";
import { normalizeName } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { LowStockRow } from "@/components/pantry/LowStockRow";
import { PantryAddForm } from "@/components/pantry/PantryAddForm";
import { PantryEditModal } from "@/components/pantry/PantryEditModal";
import { PantryItemRow } from "@/components/pantry/PantryItemRow";

export function PantryView({ items }: { items: PantryItem[] }) {
  const [query, setQuery] = useState("");
  const [editItem, setEditItem] = useState<PantryItem | null>(null);

  const filtered = useMemo(() => {
    const needle = normalizeName(query);
    const matching = needle
      ? items.filter((item) => normalizeName(item.name).includes(needle))
      : items;
    return [...matching].sort((a, b) => a.name.localeCompare(b.name, "de"));
  }, [items, query]);

  const lowStock = filtered.filter(
    (item) => item.low_stock || item.quantity <= 0
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <PantryAddForm />
        <EmptyState
          icon={PackageOpen}
          title="Dein Vorrat ist leer"
          description="Schließ deinen ersten Einkauf ab, dann füllt er sich automatisch."
          action={
            <Link
              href="/einkaufen"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent/90"
            >
              Zum Einkaufen
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PantryAddForm />

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <Input
          type="search"
          aria-label="Vorrat durchsuchen"
          placeholder="Vorrat durchsuchen …"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-11"
        />
      </div>

      {lowStock.length > 0 && (
        <section aria-label="Wird knapp">
          <h2 className="flex items-center gap-1.5 px-1 pb-2 text-sm font-semibold text-warning">
            <TriangleAlert className="size-4" aria-hidden />
            Wird knapp
          </h2>
          <div className="divide-y divide-warning/20 rounded-3xl border border-warning/30 bg-warning/10">
            {lowStock.map((item) => (
              <LowStockRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      <section aria-label="Alle Artikel">
        {lowStock.length > 0 && filtered.length > 0 && (
          <h2 className="px-1 pb-2 text-sm font-semibold text-muted">
            Alle Artikel
          </h2>
        )}
        {filtered.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-muted">
            Nichts gefunden für „{query.trim()}“.
          </p>
        ) : (
          <GlassCard className="divide-y divide-line">
            {filtered.map((item) => (
              <PantryItemRow
                key={item.id}
                item={item}
                onEdit={() => setEditItem(item)}
              />
            ))}
          </GlassCard>
        )}
      </section>

      {editItem && (
        <PantryEditModal
          key={editItem.id}
          item={editItem}
          onClose={() => setEditItem(null)}
        />
      )}
    </div>
  );
}
