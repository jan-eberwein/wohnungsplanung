"use client";

import { useMemo, useOptimistic, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronRight, ClipboardList, ShoppingCart } from "lucide-react";
import type { Category, Profile, ShoppingItemFull } from "@/lib/types";
import { groupByCategory } from "@/lib/grouping";
import {
  addShoppingItem,
  clearCheckedItems,
  deleteShoppingItem,
  toggleShoppingItem,
  updateShoppingItem,
  type ShoppingItemInput,
} from "@/lib/actions/shopping";
import { CategoryIcon } from "@/components/CategoryIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassCard } from "@/components/ui/GlassCard";
import { useToast } from "@/components/ui/Toast";
import { AddItemForm } from "./AddItemForm";
import { CheckedSection } from "./CheckedSection";
import { EditItemModal } from "./EditItemModal";
import { ShoppingItemRow } from "./ShoppingItemRow";

type OptimisticAction =
  | { type: "add"; item: ShoppingItemFull }
  | { type: "toggle"; id: string; isChecked: boolean }
  | { type: "update"; id: string; input: ShoppingItemInput; category: Category | null }
  | { type: "delete"; id: string }
  | { type: "clearChecked" };

function applyAction(
  items: ShoppingItemFull[],
  action: OptimisticAction
): ShoppingItemFull[] {
  switch (action.type) {
    case "add":
      return [action.item, ...items];
    case "toggle":
      return items.map((item) =>
        item.id === action.id
          ? {
              ...item,
              is_checked: action.isChecked,
              checked_at: action.isChecked ? new Date().toISOString() : null,
            }
          : item
      );
    case "update":
      return items.map((item) =>
        item.id === action.id
          ? {
              ...item,
              name: action.input.name,
              quantity: action.input.quantity ?? null,
              unit: action.input.unit ?? null,
              category_id: action.category?.id ?? null,
              category: action.category,
            }
          : item
      );
    case "delete":
      return items.filter((item) => item.id !== action.id);
    case "clearChecked":
      return items.filter((item) => !item.is_checked);
  }
}

/** Verweildauer des Häkchens, bevor der Artikel in den Erledigt-Bereich wandert */
const CHECK_ANIMATION_MS = 350;

export function ShoppingView({
  items,
  categories,
  profile,
}: {
  items: ShoppingItemFull[];
  categories: Category[];
  profile: Profile;
}) {
  const [optimisticItems, applyOptimistic] = useOptimistic(items, applyAction);
  const [, startTransition] = useTransition();
  const { show } = useToast();
  const [editItem, setEditItem] = useState<ShoppingItemFull | null>(null);
  /** Frisch abgehakte Artikel: Häkchen sichtbar, aber noch nicht verschoben */
  const [justChecked, setJustChecked] = useState<ReadonlySet<string>>(
    new Set()
  );
  const checkTimers = useRef(new Map<string, number>());

  const { open, checked } = useMemo(
    () => groupByCategory(optimisticItems, categories),
    [optimisticItems, categories]
  );

  const runAction = (
    optimistic: OptimisticAction,
    action: () => Promise<{ error?: string }>
  ) => {
    startTransition(async () => {
      applyOptimistic(optimistic);
      const result = await action();
      if (result.error) show(result.error, "error");
    });
  };

  const handleAdd = (input: ShoppingItemInput) => {
    const category =
      categories.find((entry) => entry.id === input.categoryId) ?? null;
    const tempItem: ShoppingItemFull = {
      id: `optimistic-${Date.now()}`,
      name: input.name,
      quantity: input.quantity ?? null,
      unit: input.unit ?? null,
      category_id: category?.id ?? null,
      from_recipe_id: null,
      is_checked: false,
      checked_at: null,
      created_at: new Date().toISOString(),
      added_by: profile.id,
      category,
      added_by_profile: {
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name,
        accent_color: profile.accent_color,
      },
      recipe: null,
    };
    runAction({ type: "add", item: tempItem }, () => addShoppingItem(input));
  };

  const handleToggle = (id: string, isChecked: boolean) => {
    const commit = () =>
      runAction({ type: "toggle", id, isChecked }, () =>
        toggleShoppingItem(id, isChecked)
      );

    const removeFromJustChecked = () =>
      setJustChecked((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });

    if (!isChecked) {
      // Läuft noch die Abhak-Animation, wird sie abgebrochen statt committet
      const pending = checkTimers.current.get(id);
      if (pending !== undefined) {
        window.clearTimeout(pending);
        checkTimers.current.delete(id);
        removeFromJustChecked();
        return;
      }
      commit();
      return;
    }

    // Häkchen kurz zeigen, dann in den Erledigt-Bereich wandern lassen
    setJustChecked((current) => new Set(current).add(id));
    const timer = window.setTimeout(() => {
      checkTimers.current.delete(id);
      removeFromJustChecked();
      commit();
    }, CHECK_ANIMATION_MS);
    checkTimers.current.set(id, timer);
  };

  const handleUpdate = (id: string, input: ShoppingItemInput) => {
    const category =
      categories.find((entry) => entry.id === input.categoryId) ?? null;
    runAction({ type: "update", id, input, category }, () =>
      updateShoppingItem(id, input)
    );
  };

  const handleDelete = (id: string) => {
    runAction({ type: "delete", id }, () => deleteShoppingItem(id));
  };

  const handleClearChecked = () => {
    runAction({ type: "clearChecked" }, () => clearCheckedItems());
  };

  return (
    <div className="flex flex-col gap-4">
      {checked.length > 0 && (
        <Link
          href="/einkaufen"
          className="glass animate-fade-in flex min-h-11 items-center gap-2.5 rounded-2xl px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-surface-strong"
        >
          <ShoppingCart className="size-4 shrink-0" aria-hidden />
          <span className="flex-1">
            {checked.length === 1
              ? "1 Artikel bereit zum Abschließen"
              : `${checked.length} Artikel bereit zum Abschließen`}
          </span>
          <ChevronRight className="size-4 shrink-0" aria-hidden />
        </Link>
      )}

      <AddItemForm categories={categories} onAdd={handleAdd} />

      {optimisticItems.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nichts auf der Liste"
          description="Füge oben etwas hinzu — Sophie und Jan sehen die Liste beide live."
        />
      ) : (
        <>
          {open.map((group) => (
            <section key={group.category?.id ?? "ohne-kategorie"}>
              <div className="flex items-center gap-2.5 px-1 pb-2">
                <span className="glass flex size-8 shrink-0 items-center justify-center rounded-full text-accent">
                  <CategoryIcon
                    icon={group.category?.icon}
                    className="size-4"
                  />
                </span>
                <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {group.category?.name ?? "Ohne Kategorie"}
                </h2>
                <span className="text-xs tabular-nums text-muted">
                  {group.items.length}
                </span>
              </div>
              <GlassCard className="divide-y divide-line overflow-hidden">
                {group.items.map((item) => (
                  <ShoppingItemRow
                    key={item.id}
                    item={item}
                    checked={item.is_checked || justChecked.has(item.id)}
                    onToggle={(isChecked) => handleToggle(item.id, isChecked)}
                    onOpen={() => setEditItem(item)}
                  />
                ))}
              </GlassCard>
            </section>
          ))}

          {checked.length > 0 && (
            <CheckedSection
              items={checked}
              onUncheck={(id) => handleToggle(id, false)}
              onClear={handleClearChecked}
            />
          )}
        </>
      )}

      <EditItemModal
        item={editItem}
        categories={categories}
        onClose={() => setEditItem(null)}
        onSave={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
