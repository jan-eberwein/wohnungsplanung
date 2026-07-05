import type { Tables } from "@/lib/database.types";

export type Profile = Tables<"profiles">;
export type Category = Tables<"categories">;
export type ShoppingItem = Tables<"shopping_items">;
export type Purchase = Tables<"purchases">;
export type PurchaseItem = Tables<"purchase_items">;
export type PantryItem = Tables<"pantry_items">;
export type Recipe = Tables<"recipes">;
export type RecipeIngredient = Tables<"recipe_ingredients">;
export type Settlement = Tables<"settlements">;
export type CookingLogEntry = Tables<"cooking_log">;
export type WeekPlanEntry = Tables<"week_plan">;

export type SplitType = "50_50" | "custom" | "full";

export type ShoppingItemFull = ShoppingItem & {
  category: Category | null;
  added_by_profile: Pick<Profile, "id" | "username" | "display_name" | "accent_color">;
  recipe: Pick<Recipe, "id" | "title"> | null;
};

export type PurchaseFull = Purchase & {
  payer: Pick<Profile, "id" | "username" | "display_name" | "accent_color">;
  items: PurchaseItem[];
  /** Signierte URL für die Beleg-Vorschau, server-seitig ergänzt */
  receipt_url: string | null;
};

export type RecipeFull = Recipe & {
  ingredients: RecipeIngredient[];
  created_by_profile: Pick<Profile, "id" | "username" | "display_name" | "accent_color">;
  /** Signierte URL für das Rezeptfoto, server-seitig ergänzt */
  image_url: string | null;
};

export type IngredientAvailability = {
  ingredient: RecipeIngredient;
  pantryItem: PantryItem | null;
  available: boolean;
  /** Fehlende Menge; null, wenn keine Menge angegeben ist und nur die Präsenz zählt */
  missingQuantity: number | null;
};

export type RecipeCookability = {
  cookable: boolean;
  availability: IngredientAvailability[];
  missing: IngredientAvailability[];
};

export type RecipeWithCookability = RecipeFull & {
  cookability: RecipeCookability;
};

export type BalanceInfo = {
  /** Wer bekommt Geld (null, wenn ausgeglichen) */
  creditor: Profile | null;
  /** Wer schuldet Geld (null, wenn ausgeglichen) */
  debtor: Profile | null;
  amount: number;
};

export type MonthStats = {
  total: number;
  count: number;
  average: number;
};

export type WeekPlanEntryFull = WeekPlanEntry & {
  recipe: Pick<Recipe, "id" | "title" | "tags">;
};

/** Einheitlicher Namensvergleich über Einkaufsliste, Vorrat und Rezepte */
export function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}
