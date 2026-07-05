"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profiles";
import { normalizeName } from "@/lib/types";

export async function upsertPantryItem(input: {
  name: string;
  quantity: number;
  unit?: string | null;
  /**
   * "add": Menge zu einem vorhandenen Artikel addieren (Hinzufügen-Formular).
   * "set": Menge exakt setzen (Bearbeiten-Modal). Default "set".
   */
  mode?: "add" | "set";
}): Promise<{ error?: string }> {
  const name = input.name.trim();
  if (!name) return { error: "Bitte einen Namen eingeben." };

  const supabase = await createClient();
  const { data: existing } = await supabase.from("pantry_items").select("*");
  const match = (existing ?? []).find(
    (item) => normalizeName(item.name) === normalizeName(name)
  );

  const nextQuantity =
    match && input.mode === "add"
      ? match.quantity + input.quantity
      : input.quantity;

  const { error } = match
    ? await supabase
        .from("pantry_items")
        .update({
          quantity: Math.max(0, nextQuantity),
          unit: input.unit?.trim() || match.unit,
        })
        .eq("id", match.id)
    : await supabase.from("pantry_items").insert({
        name,
        quantity: Math.max(0, input.quantity),
        unit: input.unit?.trim() || null,
      });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function setPantryQuantity(
  id: string,
  quantity: number
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("pantry_items")
    .update({ quantity: Math.max(0, quantity) })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function setLowStock(
  id: string,
  lowStock: boolean
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("pantry_items")
    .update({ low_stock: lowStock })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function deletePantryItem(
  id: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("pantry_items").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

/** Knappen Vorrats-Artikel mit einem Klick auf die Einkaufsliste setzen. */
export async function addPantryItemToShopping(
  pantryItemId: string
): Promise<{ error?: string; alreadyListed?: boolean }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Nicht angemeldet." };

  const supabase = await createClient();
  const { data: pantryItem } = await supabase
    .from("pantry_items")
    .select("*")
    .eq("id", pantryItemId)
    .maybeSingle();
  if (!pantryItem) return { error: "Artikel nicht gefunden." };

  const { data: openItems } = await supabase
    .from("shopping_items")
    .select("id, name")
    .eq("is_checked", false);
  const alreadyListed = (openItems ?? []).some(
    (item) => normalizeName(item.name) === normalizeName(pantryItem.name)
  );
  if (alreadyListed) return { alreadyListed: true };

  const { error } = await supabase.from("shopping_items").insert({
    name: pantryItem.name,
    unit: pantryItem.unit,
    added_by: profile.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}
