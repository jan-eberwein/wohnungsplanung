"use client";

import type { ShoppingItemFull } from "@/lib/types";
import { formatQuantity } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";

export function ShoppingItemRow({
  item,
  checked,
  onToggle,
  onOpen,
}: {
  item: ShoppingItemFull;
  /** Angezeigter Häkchen-Zustand (kann während der Abhak-Animation vom Item abweichen) */
  checked: boolean;
  onToggle: (isChecked: boolean) => void;
  onOpen: () => void;
}) {
  const quantityLabel = formatQuantity(item.quantity, item.unit);

  return (
    <div className="flex items-center pl-3 pr-3">
      <Checkbox
        checked={checked}
        onChange={onToggle}
        aria-label={
          checked ? `${item.name} wieder aktivieren` : `${item.name} abhaken`
        }
        className="shrink-0 pr-1"
      />
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${item.name} bearbeiten`}
        className="flex min-h-12 min-w-0 flex-1 items-center gap-2.5 py-2 text-left"
      >
        <span className="min-w-0 flex-1">
          <span
            className={[
              "block truncate text-sm",
              checked
                ? "text-muted line-through"
                : "font-medium text-foreground",
            ].join(" ")}
          >
            {item.name}
          </span>
          {item.recipe && (
            <Badge
              tone="accent"
              title={`Aus Rezept: ${item.recipe.title}`}
              className="mt-0.5 max-w-full"
            >
              <span className="truncate">aus „{item.recipe.title}“</span>
            </Badge>
          )}
        </span>
        {quantityLabel && (
          <span className="shrink-0 text-sm tabular-nums text-muted">
            {quantityLabel}
          </span>
        )}
        <Avatar
          name={item.added_by_profile.display_name}
          color={item.added_by_profile.accent_color}
          size="sm"
        />
      </button>
    </div>
  );
}
