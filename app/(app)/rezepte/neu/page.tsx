import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { RecipeForm } from "@/components/recipes/RecipeForm";

export const metadata: Metadata = {
  title: "Neues Rezept",
};

export default function NeuesRezeptPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader
        title="Neues Rezept"
        description="Titel, Zutaten und Zubereitung – mehr braucht es nicht."
      />
      <RecipeForm />
    </div>
  );
}
