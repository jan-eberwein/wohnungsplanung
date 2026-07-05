"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildPantryMap, computeCookability } from "@/lib/cookability";
import { getCurrentProfile } from "@/lib/data/profiles";
import { getWeekPlan } from "@/lib/data/recipes";
import { deleteImage, uploadImage, UploadError } from "@/lib/data/storage";
import { normalizeName, type RecipeIngredient } from "@/lib/types";

export type IngredientInput = {
  name: string;
  quantity: number | null;
  unit: string | null;
};

function parseIngredients(raw: FormDataEntryValue | null): IngredientInput[] {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const parsed = JSON.parse(raw) as IngredientInput[];
    return parsed
      .filter((ingredient) => ingredient.name?.trim())
      .map((ingredient) => ({
        name: ingredient.name.trim(),
        quantity:
          typeof ingredient.quantity === "number" &&
          Number.isFinite(ingredient.quantity)
            ? ingredient.quantity
            : null,
        unit: ingredient.unit?.trim() || null,
      }));
  } catch {
    return [];
  }
}

function parseTags(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string") return [];
  return [...new Set(
    raw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
  )];
}

/**
 * FormData-Felder: title, instructions, tags (kommagetrennt),
 * ingredients (JSON-Array aus {name, quantity, unit}), image (Datei, optional)
 */
export async function saveRecipe(
  recipeId: string | null,
  formData: FormData
): Promise<{ error?: string; recipeId?: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Nicht angemeldet." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Bitte einen Titel eingeben." };

  const ingredients = parseIngredients(formData.get("ingredients"));
  if (ingredients.length === 0) {
    return { error: "Bitte mindestens eine Zutat angeben." };
  }

  const instructions = String(formData.get("instructions") ?? "").trim();
  const tags = parseTags(formData.get("tags"));

  const supabase = await createClient();

  let imagePath: string | null | undefined;
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    try {
      imagePath = await uploadImage("recipes", image);
    } catch (error) {
      return {
        error:
          error instanceof UploadError
            ? error.message
            : "Das Foto konnte nicht hochgeladen werden.",
      };
    }
  }

  let id = recipeId;
  // IDs der bisherigen Zutaten, die nach erfolgreichem Neu-Insert gelöscht
  // werden. So bleibt das Rezept bei einem Fehler nie ohne Zutaten.
  let previousIngredientIds: string[] = [];

  if (id) {
    const { data: existing } = await supabase
      .from("recipes")
      .select("image_path")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase
      .from("recipes")
      .update({
        title,
        instructions,
        tags,
        ...(imagePath !== undefined ? { image_path: imagePath } : {}),
      })
      .eq("id", id);
    if (error) return { error: error.message };

    if (imagePath !== undefined && existing?.image_path) {
      await deleteImage("recipes", existing.image_path);
    }

    const { data: oldIngredients } = await supabase
      .from("recipe_ingredients")
      .select("id")
      .eq("recipe_id", id);
    previousIngredientIds = (oldIngredients ?? []).map((row) => row.id);
  } else {
    const { data, error } = await supabase
      .from("recipes")
      .insert({
        title,
        instructions,
        tags,
        image_path: imagePath ?? null,
        created_by: profile.id,
      })
      .select("id")
      .single();
    if (error || !data) {
      return { error: error?.message ?? "Rezept konnte nicht gespeichert werden." };
    }
    id = data.id;
  }

  const { error: ingredientsError } = await supabase
    .from("recipe_ingredients")
    .insert(
      ingredients.map((ingredient, index) => ({
        recipe_id: id!,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        sort_order: index * 10,
      }))
    );
  if (ingredientsError) return { error: ingredientsError.message };

  // Erst jetzt die alten Zutaten entfernen — die neuen sind bereits da.
  if (previousIngredientIds.length > 0) {
    await supabase
      .from("recipe_ingredients")
      .delete()
      .in("id", previousIngredientIds);
  }

  revalidatePath("/", "layout");
  return { recipeId: id! };
}

export async function deleteRecipe(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: recipe } = await supabase
    .from("recipes")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) return { error: error.message };

  if (recipe?.image_path) {
    await deleteImage("recipes", recipe.image_path);
  }

  revalidatePath("/", "layout");
  return {};
}

/** Reduziert den Vorrat um die verwendeten Zutaten und loggt den Kochvorgang. */
export async function markCooked(
  recipeId: string
): Promise<{ error?: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Nicht angemeldet." };

  const supabase = await createClient();
  const [{ data: ingredients }, { data: pantryItems }] = await Promise.all([
    supabase.from("recipe_ingredients").select("*").eq("recipe_id", recipeId),
    supabase.from("pantry_items").select("*"),
  ]);

  for (const ingredient of ingredients ?? []) {
    const match = (pantryItems ?? []).find(
      (pantryItem) =>
        normalizeName(pantryItem.name) === normalizeName(ingredient.name)
    );
    if (!match || ingredient.quantity === null) continue;

    const newQuantity =
      Math.round(Math.max(0, match.quantity - ingredient.quantity) * 100) / 100;
    await supabase
      .from("pantry_items")
      .update({ quantity: newQuantity })
      .eq("id", match.id);
  }

  const { error } = await supabase.from("cooking_log").insert({
    recipe_id: recipeId,
    cooked_by: profile.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

/** Fehlende Zutaten eines Rezepts auf die Einkaufsliste setzen. */
export async function addMissingToShopping(
  recipeId: string
): Promise<{ error?: string; added?: number }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Nicht angemeldet." };

  const supabase = await createClient();
  const [{ data: ingredients }, { data: pantryItems }, { data: openItems }] =
    await Promise.all([
      supabase.from("recipe_ingredients").select("*").eq("recipe_id", recipeId),
      supabase.from("pantry_items").select("*"),
      supabase.from("shopping_items").select("*").eq("is_checked", false),
    ]);

  const { missing } = computeCookability(
    (ingredients ?? []) as RecipeIngredient[],
    buildPantryMap(pantryItems ?? [])
  );

  const toAdd = missing.filter(
    (entry) =>
      !(openItems ?? []).some(
        (item) => normalizeName(item.name) === normalizeName(entry.ingredient.name)
      )
  );

  if (toAdd.length > 0) {
    const { error } = await supabase.from("shopping_items").insert(
      toAdd.map((entry) => ({
        name: entry.ingredient.name,
        quantity: entry.missingQuantity ?? entry.ingredient.quantity,
        unit: entry.ingredient.unit,
        from_recipe_id: recipeId,
        added_by: profile.id,
      }))
    );
    if (error) return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { added: toAdd.length };
}

export async function planRecipe(
  recipeId: string,
  planDate: string
): Promise<{ error?: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Nicht angemeldet." };

  const supabase = await createClient();
  const { error } = await supabase.from("week_plan").upsert(
    { recipe_id: recipeId, plan_date: planDate, created_by: profile.id },
    { onConflict: "recipe_id,plan_date", ignoreDuplicates: true }
  );
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function unplanRecipe(
  entryId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("week_plan").delete().eq("id", entryId);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

/**
 * Erzeugt aus dem Wochenplan die Einkaufsliste: aggregiert alle Zutaten der
 * geplanten Rezepte, zieht Vorrat ab und ergänzt nur, was noch fehlt.
 */
export async function generateWeekShoppingList(
  weekStart: string
): Promise<{ error?: string; added?: number }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Nicht angemeldet." };

  const entries = await getWeekPlan(weekStart);
  if (entries.length === 0) return { added: 0 };

  const supabase = await createClient();
  const recipeIds = [...new Set(entries.map((entry) => entry.recipe_id))];
  const [{ data: ingredients }, { data: pantryItems }, { data: openItems }] =
    await Promise.all([
      supabase.from("recipe_ingredients").select("*").in("recipe_id", recipeIds),
      supabase.from("pantry_items").select("*"),
      supabase.from("shopping_items").select("*").eq("is_checked", false),
    ]);

  // Bedarf über alle geplanten Rezepte aggregieren (Mehrfach-Planung zählt mehrfach)
  const countByRecipe = new Map<string, number>();
  for (const entry of entries) {
    countByRecipe.set(
      entry.recipe_id,
      (countByRecipe.get(entry.recipe_id) ?? 0) + 1
    );
  }

  type Need = {
    name: string;
    quantity: number | null;
    unit: string | null;
    recipeId: string;
  };
  const needs = new Map<string, Need>();
  for (const ingredient of ingredients ?? []) {
    const multiplier = countByRecipe.get(ingredient.recipe_id) ?? 1;
    const key = normalizeName(ingredient.name);
    const existing = needs.get(key);
    const addedQuantity =
      ingredient.quantity === null ? null : ingredient.quantity * multiplier;
    if (!existing) {
      needs.set(key, {
        name: ingredient.name,
        quantity: addedQuantity,
        unit: ingredient.unit,
        recipeId: ingredient.recipe_id,
      });
    } else if (existing.quantity !== null && addedQuantity !== null) {
      existing.quantity += addedQuantity;
    } else {
      existing.quantity = null; // gemischt quantifiziert → nur Präsenz
    }
  }

  const pantryMap = buildPantryMap(pantryItems ?? []);
  const toAdd: Need[] = [];
  for (const [key, need] of needs) {
    const alreadyListed = (openItems ?? []).some(
      (item) => normalizeName(item.name) === key
    );
    if (alreadyListed) continue;

    const pantryItem = pantryMap.get(key);
    if (!pantryItem || pantryItem.quantity <= 0) {
      toAdd.push(need);
    } else if (need.quantity !== null && pantryItem.quantity < need.quantity) {
      toAdd.push({
        ...need,
        quantity:
          Math.round((need.quantity - pantryItem.quantity) * 100) / 100,
      });
    }
  }

  if (toAdd.length > 0) {
    const { error } = await supabase.from("shopping_items").insert(
      toAdd.map((need) => ({
        name: need.name,
        quantity: need.quantity,
        unit: need.unit,
        from_recipe_id: need.recipeId,
        added_by: profile.id,
      }))
    );
    if (error) return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { added: toAdd.length };
}
