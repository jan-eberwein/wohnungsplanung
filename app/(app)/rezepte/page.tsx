import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getRecipesWithCookability, getWeekPlan } from "@/lib/data/recipes";
import { startOfWeek, toDateString } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { RecipeList } from "@/components/recipes/RecipeList";
import { WeekPlanSection } from "@/components/recipes/WeekPlanSection";

export const metadata: Metadata = {
  title: "Rezepte",
};

export default async function RezeptePage() {
  const today = toDateString(new Date());
  const weekStart = toDateString(startOfWeek(new Date()));
  const [recipes, weekPlan] = await Promise.all([
    getRecipesWithCookability(),
    getWeekPlan(weekStart),
  ]);

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <PageHeader
          title="Rezepte"
          description="Was können wir heute kochen?"
          action={
            <Link
              href="/rezepte/neu"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Plus className="size-4" aria-hidden />
              Neues Rezept
            </Link>
          }
        />
        <RecipeList recipes={recipes} />
      </div>
      <WeekPlanSection
        weekStart={weekStart}
        today={today}
        entries={weekPlan}
        recipes={recipes.map((recipe) => ({
          id: recipe.id,
          title: recipe.title,
        }))}
      />
    </div>
  );
}
