import { createClient } from "@/lib/supabase/server";
import { buildPantryMap, computeCookability } from "@/lib/cookability";
import { getPantryItems } from "@/lib/data/pantry";
import { getSignedUrl } from "@/lib/data/storage";
import { toDateString } from "@/lib/format";
import type {
  RecipeFull,
  RecipeWithCookability,
  WeekPlanEntryFull,
} from "@/lib/types";

const RECIPE_SELECT =
  "*, ingredients:recipe_ingredients(*), created_by_profile:profiles(id, username, display_name, accent_color)";

type RecipeRow = Omit<RecipeFull, "image_url">;

function sortIngredients(recipe: RecipeRow): RecipeRow {
  return {
    ...recipe,
    ingredients: [...recipe.ingredients].sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  };
}

export async function getRecipesWithCookability(): Promise<
  RecipeWithCookability[]
> {
  const supabase = await createClient();
  const [recipesResult, pantryItems] = await Promise.all([
    supabase
      .from("recipes")
      .select(RECIPE_SELECT)
      .order("created_at", { ascending: false }),
    getPantryItems(),
  ]);
  if (recipesResult.error) {
    throw new Error(`Rezepte laden fehlgeschlagen: ${recipesResult.error.message}`);
  }

  const pantryMap = buildPantryMap(pantryItems);
  const recipes = (recipesResult.data ?? []) as unknown as RecipeRow[];

  return Promise.all(
    recipes.map(sortIngredients).map(async (recipe) => ({
      ...recipe,
      image_url: await getSignedUrl("recipes", recipe.image_path),
      cookability: computeCookability(recipe.ingredients, pantryMap),
    }))
  );
}

export async function getRecipe(
  id: string
): Promise<RecipeWithCookability | null> {
  const supabase = await createClient();
  const [recipeResult, pantryItems] = await Promise.all([
    supabase.from("recipes").select(RECIPE_SELECT).eq("id", id).maybeSingle(),
    getPantryItems(),
  ]);
  if (!recipeResult.data) return null;

  const recipe = sortIngredients(recipeResult.data as unknown as RecipeRow);
  return {
    ...recipe,
    image_url: await getSignedUrl("recipes", recipe.image_path),
    cookability: computeCookability(
      recipe.ingredients,
      buildPantryMap(pantryItems)
    ),
  };
}

/** Wochenplan-Einträge für 7 Tage ab weekStart (YYYY-MM-DD) */
export async function getWeekPlan(
  weekStart: string
): Promise<WeekPlanEntryFull[]> {
  const supabase = await createClient();
  const end = new Date(`${weekStart}T00:00:00`);
  end.setDate(end.getDate() + 7);
  // Lokale Datumszeichenkette, damit die 7-Tage-Grenze nicht durch die
  // UTC-Konvertierung von toISOString() um einen Tag verrutscht.
  const endString = toDateString(end);

  const { data } = await supabase
    .from("week_plan")
    .select("*, recipe:recipes(id, title, tags)")
    .gte("plan_date", weekStart)
    .lt("plan_date", endString)
    .order("plan_date");
  return (data ?? []) as unknown as WeekPlanEntryFull[];
}
