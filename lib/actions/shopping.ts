"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profiles";

export type ShoppingItemInput = {
  name: string;
  quantity?: number | null;
  unit?: string | null;
  categoryId?: string | null;
};

export async function addShoppingItem(
  input: ShoppingItemInput
): Promise<{ error?: string }> {
  const name = input.name.trim();
  if (!name) return { error: "Bitte einen Namen eingeben." };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Nicht angemeldet." };

  const supabase = await createClient();
  const { error } = await supabase.from("shopping_items").insert({
    name,
    quantity: input.quantity ?? null,
    unit: input.unit?.trim() || null,
    category_id: input.categoryId ?? null,
    added_by: profile.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function toggleShoppingItem(
  id: string,
  isChecked: boolean
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("shopping_items")
    .update({
      is_checked: isChecked,
      checked_at: isChecked ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function updateShoppingItem(
  id: string,
  input: ShoppingItemInput
): Promise<{ error?: string }> {
  const name = input.name.trim();
  if (!name) return { error: "Bitte einen Namen eingeben." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("shopping_items")
    .update({
      name,
      quantity: input.quantity ?? null,
      unit: input.unit?.trim() || null,
      category_id: input.categoryId ?? null,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function deleteShoppingItem(
  id: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("shopping_items").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

/** Leert den „Erledigt"-Bereich, ohne einen Einkauf zu buchen. */
export async function clearCheckedItems(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("shopping_items")
    .delete()
    .eq("is_checked", true);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}
