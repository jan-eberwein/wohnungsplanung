"use client";

import { useState } from "react";
import Link from "next/link";
import { CookingPot, SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import type { RecipeWithCookability } from "@/lib/types";

type CookabilityFilter = "alle" | "kochbar" | "fehlt";

const FILTER_OPTIONS: { value: CookabilityFilter; label: string }[] = [
  { value: "alle", label: "Alle" },
  { value: "kochbar", label: "Sofort kochbar" },
  { value: "fehlt", label: "Fehlt was" },
];

export function RecipeList({ recipes }: { recipes: RecipeWithCookability[] }) {
  const [filter, setFilter] = useState<CookabilityFilter>("alle");

  if (recipes.length === 0) {
    return (
      <EmptyState
        icon={CookingPot}
        title="Noch keine Rezepte"
        description="Legt euer erstes Rezept an – mit Zutaten, Foto und Zubereitung."
        action={
          <Link
            href="/rezepte/neu"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent/90"
          >
            Neues Rezept
          </Link>
        }
      />
    );
  }

  const filtered = recipes.filter((recipe) => {
    if (filter === "kochbar") return recipe.cookability.cookable;
    if (filter === "fehlt") return !recipe.cookability.cookable;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        aria-label="Rezepte filtern"
        value={filter}
        onChange={setFilter}
        options={FILTER_OPTIONS}
        className="max-w-md"
      />
      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Keine Treffer"
          description="Für diesen Filter gibt es gerade keine Rezepte."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
