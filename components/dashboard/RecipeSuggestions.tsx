import Link from "next/link";
import { CookingPot } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassCard } from "@/components/ui/GlassCard";
import type { RecipeWithCookability } from "@/lib/types";

export type RecipeSuggestionsProps = {
  recipes: RecipeWithCookability[];
};

/** Zeigt bis zu vier Rezepte, die mit dem aktuellen Vorrat kochbar sind. */
export function RecipeSuggestions({ recipes }: RecipeSuggestionsProps) {
  const cookable = recipes
    .filter((recipe) => recipe.cookability.cookable)
    .slice(0, 4);

  return (
    <section aria-labelledby="dashboard-cookable">
      <h2
        id="dashboard-cookable"
        className="px-1 text-base font-semibold tracking-tight"
      >
        Was können wir heute kochen?
      </h2>

      {cookable.length === 0 ? (
        <GlassCard className="mt-3">
          <EmptyState
            icon={CookingPot}
            title="Gerade ist nichts kochbar"
            description="Fülle den Vorrat auf oder lege ein neues Rezept an."
            action={
              <Link
                href="/rezepte"
                className="text-sm font-semibold text-accent"
              >
                Zu den Rezepten
              </Link>
            }
          />
        </GlassCard>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cookable.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/rezepte/${recipe.id}`}
              className="group block"
            >
              <GlassCard className="h-full p-5 transition-transform duration-150 group-active:scale-[0.98]">
                <h3 className="truncate font-semibold">{recipe.title}</h3>
                {recipe.tags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {recipe.tags.map((tag) => (
                      <Badge key={tag} tone="accent">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
