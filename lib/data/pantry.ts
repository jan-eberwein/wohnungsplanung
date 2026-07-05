import { createClient } from "@/lib/supabase/server";
import type { PantryItem } from "@/lib/types";

export async function getPantryItems(): Promise<PantryItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pantry_items")
    .select("*")
    .order("name");
  if (error) throw new Error(`Vorrat laden fehlgeschlagen: ${error.message}`);
  return data ?? [];
}

/** Manuell als „wird knapp" markierte oder aufgebrauchte Artikel */
export async function getLowStockItems(): Promise<PantryItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pantry_items")
    .select("*")
    .or("low_stock.eq.true,quantity.lte.0")
    .order("name");
  return data ?? [];
}
