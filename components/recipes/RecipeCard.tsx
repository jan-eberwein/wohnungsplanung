import Image from "next/image";
import Link from "next/link";
import { CookingPot } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import type { RecipeWithCookability } from "@/lib/types";

export function RecipeCard({ recipe }: { recipe: RecipeWithCookability }) {
  const missingCount = recipe.cookability.missing.length;

  return (
    <Link
      href={`/rezepte/${recipe.id}`}
      className="group block rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <GlassCard className="overflow-hidden transition-transform duration-150 group-active:scale-[0.98]">
        <div className="relative aspect-video bg-foreground/5">
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <CookingPot className="size-8 text-muted" aria-hidden />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 p-4">
          <h3 className="truncate text-base font-semibold">{recipe.title}</h3>
          <div className="flex flex-wrap gap-1.5">
            {recipe.cookability.cookable ? (
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
        </div>
      </GlassCard>
    </Link>
  );
}
