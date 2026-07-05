"use client";

import { useTransition } from "react";
import { ShoppingCart } from "lucide-react";
import type { PantryItem } from "@/lib/types";
import { addPantryItemToShopping } from "@/lib/actions/pantry";
import { formatQuantity } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

/** Zeile in der „Wird knapp“-Sektion mit Schnellaktion für die Einkaufsliste. */
export function LowStockRow({ item }: { item: PantryItem }) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const addToList = () => {
    startTransition(async () => {
      const result = await addPantryItemToShopping(item.id);
      if (result.error) {
        toast.show(result.error, "error");
        return;
      }
      if (result.alreadyListed) {
        toast.show("Steht schon auf der Liste");
        return;
      }
      toast.show(`${item.name} steht auf der Einkaufsliste.`);
    });
  };

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{item.name}</p>
        <p className="mt-0.5 text-xs text-muted">
          {item.quantity <= 0
            ? "aufgebraucht"
            : `noch ${formatQuantity(item.quantity, item.unit)}`}
        </p>
      </div>
      <Button
        size="sm"
        variant="secondary"
        loading={isPending}
        onClick={addToList}
        className="shrink-0"
      >
        <ShoppingCart className="size-4" aria-hidden />
        Auf die Liste
      </Button>
    </div>
  );
}
