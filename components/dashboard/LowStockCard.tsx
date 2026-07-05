import { Check, TriangleAlert } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatQuantity } from "@/lib/format";
import type { PantryItem } from "@/lib/types";
import { AddToShoppingButton } from "@/components/dashboard/AddToShoppingButton";

export type LowStockCardProps = {
  items: PantryItem[];
};

export function LowStockCard({ items }: LowStockCardProps) {
  if (items.length === 0) {
    return (
      <GlassCard className="p-5">
        <div className="flex items-center gap-2">
          <Check className="size-4 text-success" aria-hidden />
          <h2 className="text-sm font-semibold text-muted">Vorrat</h2>
        </div>
        <p className="mt-3 text-sm text-muted">
          Im Vorrat wird gerade nichts knapp.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2">
        <TriangleAlert className="size-4 text-warning" aria-hidden />
        <h2 className="text-sm font-semibold text-muted">Vorrat wird knapp</h2>
      </div>
      <ul className="mt-2 divide-y divide-line">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted">
                {item.quantity <= 0
                  ? "Aufgebraucht"
                  : `Noch ${formatQuantity(item.quantity, item.unit)}`}
              </p>
            </div>
            <AddToShoppingButton pantryItemId={item.id} />
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
