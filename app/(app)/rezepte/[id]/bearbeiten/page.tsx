import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRecipe } from "@/lib/data/recipes";
import { PageHeader } from "@/components/ui/PageHeader";
import { RecipeForm } from "@/components/recipes/RecipeForm";

export const metadata: Metadata = {
  title: "Rezept bearbeiten",
};

export default async function RezeptBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipe(id);
  if (!recipe) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader title="Rezept bearbeiten" description={recipe.title} />
      <RecipeForm
        recipeId={recipe.id}
        initial={{
          title: recipe.title,
          instructions: recipe.instructions,
          tags: recipe.tags,
          ingredients: recipe.ingredients.map((ingredient) => ({
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
          })),
          imageUrl: recipe.image_url,
        }}
      />
    </div>
  );
}
