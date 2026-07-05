"use client";

import { useOptimistic, useTransition } from "react";
import { Flag, Minus, Pencil, Plus } from "lucide-react";
import type { PantryItem } from "@/lib/types";
import { setLowStock, setPantryQuantity } from "@/lib/actions/pantry";
import { formatQuantity } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

export function PantryItemRow({
  item,
  onEdit,
}: {
  item: PantryItem;
  onEdit: () => void;
}) {
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [optimisticQuantity, applyQuantity] = useOptimistic(
    item.quantity,
    (_current, next: number) => next
  );
  const [optimisticFlag, applyFlag] = useOptimistic(
    item.low_stock,
    (_current, next: boolean) => next
  );

  const stepQuantity = (delta: number) => {
    const next = Math.max(0, optimisticQuantity + delta);
    if (next === optimisticQuantity) return;
    startTransition(async () => {
      applyQuantity(next);
      const result = await setPantryQuantity(item.id, next);
      if (result.error) toast.show(result.error, "error");
    });
  };

  const toggleFlag = () => {
    const next = !optimisticFlag;
    startTransition(async () => {
      applyFlag(next);
      const result = await setLowStock(item.id, next);
      if (result.error) toast.show(result.error, "error");
    });
  };

  const isEmpty = optimisticQuantity <= 0;

  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <div className={`min-w-0 flex-1 ${isEmpty ? "opacity-50" : ""}`}>
        <p className="flex items-center gap-2 text-sm font-medium">
          <span className="truncate">{item.name}</span>
          {isEmpty && <Badge tone="neutral">leer</Badge>}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {formatQuantity(optimisticQuantity, item.unit)}
        </p>
      </div>

      <div className="flex shrink-0 items-center rounded-full border border-line bg-surface">
        <button
          type="button"
          onClick={() => stepQuantity(-1)}
          disabled={isEmpty}
          aria-label={`${item.name}: Menge verringern`}
          className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/5 active:bg-foreground/10 disabled:pointer-events-none disabled:opacity-40"
        >
          <Minus className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => stepQuantity(1)}
          aria-label={`${item.name}: Menge erhöhen`}
          className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/5 active:bg-foreground/10"
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>

      <button
        type="button"
        onClick={toggleFlag}
        aria-pressed={optimisticFlag}
        aria-label={
          optimisticFlag
            ? `${item.name}: Markierung „wird knapp“ entfernen`
            : `${item.name}: als „wird knapp“ markieren`
        }
        className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-foreground/5 active:bg-foreground/10 ${
          optimisticFlag ? "text-warning" : "text-muted"
        }`}
      >
        <Flag
          className="size-4"
          fill={optimisticFlag ? "currentColor" : "none"}
          aria-hidden
        />
      </button>

      <button
        type="button"
        onClick={onEdit}
        aria-label={`${item.name} bearbeiten`}
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/5 hover:text-foreground active:bg-foreground/10"
      >
        <Pencil className="size-4" aria-hidden />
      </button>
    </div>
  );
}
