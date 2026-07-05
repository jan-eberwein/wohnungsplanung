import { createClient } from "@/lib/supabase/server";
import type { ShoppingItemFull } from "@/lib/types";

export const SHOPPING_ITEM_SELECT =
  "*, category:categories(*), added_by_profile:profiles(id, username, display_name, accent_color), recipe:recipes(id, title)";

export async function getShoppingItems(): Promise<ShoppingItemFull[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shopping_items")
    .select(SHOPPING_ITEM_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Einkaufsliste laden fehlgeschlagen: ${error.message}`);
  return (data ?? []) as unknown as ShoppingItemFull[];
}

export async function getOpenItemCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("shopping_items")
    .select("*", { count: "exact", head: true })
    .eq("is_checked", false);
  return count ?? 0;
}
