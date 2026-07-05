import type { Category, ShoppingItemFull } from "@/lib/types";

export type CategoryGroup = {
  category: Category | null;
  items: ShoppingItemFull[];
};

/**
 * Gruppiert offene Artikel nach Kategorie (sortiert nach sort_order);
 * Artikel ohne Kategorie landen in der letzten Gruppe.
 */
export function groupByCategory(
  items: ShoppingItemFull[],
  categories: Category[]
): { open: CategoryGroup[]; checked: ShoppingItemFull[] } {
  const open = items.filter((item) => !item.is_checked);
  const checked = items
    .filter((item) => item.is_checked)
    .sort((x, y) => (y.checked_at ?? "").localeCompare(x.checked_at ?? ""));

  const groups: CategoryGroup[] = [];
  for (const category of [...categories].sort(
    (x, y) => x.sort_order - y.sort_order
  )) {
    const inCategory = open.filter((item) => item.category_id === category.id);
    if (inCategory.length > 0) {
      groups.push({ category, items: inCategory });
    }
  }

  const uncategorized = open.filter(
    (item) =>
      item.category_id === null ||
      !categories.some((category) => category.id === item.category_id)
  );
  if (uncategorized.length > 0) {
    groups.push({ category: null, items: uncategorized });
  }

  return { open: groups, checked };
}
