import {
  normalizeName,
  type IngredientAvailability,
  type PantryItem,
  type RecipeCookability,
  type RecipeIngredient,
} from "@/lib/types";

export function buildPantryMap(items: PantryItem[]): Map<string, PantryItem> {
  const map = new Map<string, PantryItem>();
  for (const item of items) {
    map.set(normalizeName(item.name), item);
  }
  return map;
}

/**
 * Prüft, ob ein Rezept mit dem aktuellen Vorrat kochbar ist.
 * Zutaten ohne Mengenangabe gelten als verfügbar, sobald der Artikel
 * mit Menge > 0 im Vorrat liegt.
 */
export function computeCookability(
  ingredients: RecipeIngredient[],
  pantry: Map<string, PantryItem>
): RecipeCookability {
  const availability: IngredientAvailability[] = ingredients.map(
    (ingredient) => {
      const pantryItem = pantry.get(normalizeName(ingredient.name)) ?? null;

      if (!pantryItem || pantryItem.quantity <= 0) {
        return {
          ingredient,
          pantryItem,
          available: false,
          missingQuantity: ingredient.quantity,
        };
      }

      if (ingredient.quantity === null) {
        return { ingredient, pantryItem, available: true, missingQuantity: 0 };
      }

      const missing =
        Math.round((ingredient.quantity - pantryItem.quantity) * 100) / 100;
      return {
        ingredient,
        pantryItem,
        available: missing <= 0,
        missingQuantity: Math.max(0, missing),
      };
    }
  );

  return {
    // Ein Rezept ganz ohne Zutaten gilt nicht als "sofort kochbar".
    cookable:
      availability.length > 0 &&
      availability.every((entry) => entry.available),
    availability,
    missing: availability.filter((entry) => !entry.available),
  };
}
