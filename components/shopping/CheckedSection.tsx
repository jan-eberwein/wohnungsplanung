"use client";

import { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import type { ShoppingItemFull } from "@/lib/types";
import { formatQuantity } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GlassCard } from "@/components/ui/GlassCard";

export function CheckedSection({
  items,
  onUncheck,
  onClear,
}: {
  items: ShoppingItemFull[];
  onUncheck: (id: string) => void;
  onClear: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <section>
      <GlassCard className="overflow-hidden">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors hover:bg-foreground/5"
        >
          <span className="text-sm font-semibold">
            Erledigt{" "}
            <span className="font-normal text-muted">({items.length})</span>
          </span>
          <ChevronDown
            className={[
              "size-4 text-muted transition-transform duration-200",
              expanded ? "rotate-180" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden
          />
        </button>

        {expanded && (
          <div className="animate-fade-in border-t border-line">
            <ul className="divide-y divide-line">
              {items.map((item) => {
                const quantityLabel = formatQuantity(item.quantity, item.unit);
                return (
                  <li key={item.id} className="px-3">
                    <Checkbox
                      checked
                      onChange={() => onUncheck(item.id)}
                      aria-label={`${item.name} wieder aktivieren`}
                      className="min-h-12 w-full"
                      label={
                        <>
                          {item.name}
                          {quantityLabel && (
                            <span className="ml-2 text-xs">
                              {quantityLabel}
                            </span>
                          )}
                        </>
                      }
                    />
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-line p-2">
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => setConfirmOpen(true)}
                className="text-danger hover:bg-danger/10 active:bg-danger/15"
              >
                <Trash2 className="size-4" aria-hidden />
                Erledigte löschen
              </Button>
            </div>
          </div>
        )}
      </GlassCard>

      <ConfirmDialog
        open={confirmOpen}
        title="Erledigte löschen?"
        description={
          items.length === 1
            ? "1 erledigter Artikel wird dauerhaft von der Liste entfernt."
            : `${items.length} erledigte Artikel werden dauerhaft von der Liste entfernt.`
        }
        confirmLabel="Löschen"
        danger
        onConfirm={onClear}
        onClose={() => setConfirmOpen(false)}
      />
    </section>
  );
}
