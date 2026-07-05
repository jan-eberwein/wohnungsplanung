"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCategory(
  name: string,
  icon = "shopping-basket"
): Promise<{ error?: string }> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Bitte einen Namen eingeben." };

  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextSortOrder = (categories?.[0]?.sort_order ?? 0) + 10;

  const { error } = await supabase
    .from("categories")
    .insert({ name: trimmed, icon, sort_order: nextSortOrder });
  if (error) {
    return {
      error: error.code === "23505" ? "Diese Kategorie gibt es schon." : error.message,
    };
  }

  revalidatePath("/", "layout");
  return {};
}

export async function renameCategory(
  id: string,
  name: string
): Promise<{ error?: string }> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Bitte einen Namen eingeben." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ name: trimmed })
    .eq("id", id);
  if (error) {
    return {
      error: error.code === "23505" ? "Diese Kategorie gibt es schon." : error.message,
    };
  }

  revalidatePath("/", "layout");
  return {};
}

/** Artikel behalten ihre Einträge, verlieren nur die Kategorie-Zuordnung. */
export async function deleteCategory(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}
