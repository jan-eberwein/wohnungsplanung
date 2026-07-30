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
export type DateIdea = Tables<"date_ideas">;
export type DateEntry = Tables<"dates">;
export type DatePhoto = Tables<"date_photos">;

export type SplitType = "50_50" | "custom" | "full";

export type DateStatus = "geplant" | "erledigt";

/** Ein Foto eines Dates inkl. server-seitig ergänzter signierter URL */
export type DatePhotoWithUrl = DatePhoto & { url: string | null };

export type DateEntryFull = DateEntry & {
  photos: DatePhotoWithUrl[];
  created_by_profile: Pick<
    Profile,
    "id" | "username" | "display_name" | "accent_color"
  >;
};

export type DateCategoryKey =
  | "zuhause"
  | "kulinarik"
  | "draussen"
  | "kultur"
  | "abenteuer"
  | "reise"
  | "kreativ"
  | "saisonal"
  | "sonstiges";

export type DateCategoryMeta = {
  key: DateCategoryKey;
  label: string;
  emoji: string;
};

/** Reihenfolge = Anzeigereihenfolge der Filter-Chips */
export const DATE_CATEGORIES: DateCategoryMeta[] = [
  { key: "zuhause", label: "Zuhause", emoji: "🏠" },
  { key: "kulinarik", label: "Kulinarik", emoji: "🍽️" },
  { key: "draussen", label: "Draußen", emoji: "🌳" },
  { key: "kultur", label: "Kultur", emoji: "🎭" },
  { key: "abenteuer", label: "Abenteuer", emoji: "🎢" },
  { key: "reise", label: "Reise", emoji: "✈️" },
  { key: "kreativ", label: "Kreativ", emoji: "🎨" },
  { key: "saisonal", label: "Saisonal", emoji: "🍂" },
  { key: "sonstiges", label: "Sonstiges", emoji: "💫" },
];

const CATEGORY_BY_KEY = new Map(
  DATE_CATEGORIES.map((category) => [category.key, category])
);

export function dateCategoryMeta(key: string | null): DateCategoryMeta {
  return (
    CATEGORY_BY_KEY.get((key ?? "sonstiges") as DateCategoryKey) ??
    CATEGORY_BY_KEY.get("sonstiges")!
  );
}

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
