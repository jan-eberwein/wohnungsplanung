import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronLeft } from "lucide-react";
import { getRecipe } from "@/lib/data/recipes";
import { formatDate, formatQuantity } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { RecipeDetailActions } from "@/components/recipes/RecipeDetailActions";

export default async function RezeptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipe(id);
  if (!recipe) notFound();

  const { cookability } = recipe;
  const missingCount = cookability.missing.length;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-8 pt-4">
      <Link
        href="/rezepte"
        className="inline-flex items-center gap-1 self-start text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Alle Rezepte
      </Link>

      {recipe.image_url && (
        <div className="relative aspect-video overflow-hidden rounded-3xl">
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{recipe.title}</h1>
        <div className="flex flex-wrap gap-1.5">
          {cookability.cookable ? (
            <Badge tone="success">Sofort kochbar</Badge>
          ) : (
            <Badge tone="warning">
              {missingCount === 1
                ? "1 Zutat fehlt"
                : `${missingCount} Zutaten fehlen`}
            </Badge>
          )}
          {recipe.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Avatar
            name={recipe.created_by_profile.display_name}
            color={recipe.created_by_profile.accent_color}
            size="sm"
          />
          <span>
            von {recipe.created_by_profile.display_name} ·{" "}
            {formatDate(recipe.created_at)}
          </span>
        </div>
      </div>

      <RecipeDetailActions recipeId={recipe.id} cookable={cookability.cookable} />

      <GlassCard className="p-5">
        <h2 className="text-lg font-semibold">Zutaten</h2>
        <ul className="mt-2 divide-y divide-line">
          {cookability.availability.map((entry) => (
            <li
              key={entry.ingredient.id}
              className="flex items-center gap-3 py-2.5"
            >
              {entry.available ? (
                <Check
                  className="size-4 shrink-0 text-success"
                  aria-label="Vorrätig"
                />
              ) : (
                <span
                  className="flex size-4 shrink-0 items-center justify-center"
                  role="img"
                  aria-label="Fehlt im Vorrat"
                >
                  <span className="size-2.5 rounded-full bg-warning" />
                </span>
              )}
              <span className="min-w-0 flex-1 truncate">
                {entry.ingredient.name}
              </span>
              <span className="flex shrink-0 flex-col items-end">
                <span className="text-sm text-muted">
                  {formatQuantity(
                    entry.ingredient.quantity,
                    entry.ingredient.unit
                  )}
                </span>
                {!entry.available &&
                  entry.missingQuantity !== null &&
                  entry.missingQuantity > 0 && (
                    <span className="text-xs font-medium text-warning">
                      fehlen{" "}
                      {formatQuantity(
                        entry.missingQuantity,
                        entry.ingredient.unit
                      )}
                    </span>
                  )}
              </span>
            </li>
          ))}
        </ul>
      </GlassCard>

      {recipe.instructions && (
        <GlassCard className="p-5">
          <h2 className="text-lg font-semibold">Zubereitung</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
            {recipe.instructions}
          </p>
        </GlassCard>
      )}
    </div>
  );
}
