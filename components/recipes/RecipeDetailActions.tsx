"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListPlus, Pencil, Trash2, Utensils } from "lucide-react";
import {
  addMissingToShopping,
  deleteRecipe,
  markCooked,
} from "@/lib/actions/recipes";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

export type RecipeDetailActionsProps = {
  recipeId: string;
  cookable: boolean;
};

export function RecipeDetailActions({
  recipeId,
  cookable,
}: RecipeDetailActionsProps) {
  const router = useRouter();
  const { show } = useToast();
  const [confirmCook, setConfirmCook] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState<"cook" | "shop" | "delete" | null>(null);

  async function handleCooked() {
    setBusy("cook");
    const result = await markCooked(recipeId);
    setBusy(null);
    if (result.error) {
      show(result.error, "error");
      return;
    }
    show("Guten Appetit!");
  }

  async function handleAddMissing() {
    setBusy("shop");
    const result = await addMissingToShopping(recipeId);
    setBusy(null);
    if (result.error) {
      show(result.error, "error");
      return;
    }
    const added = result.added ?? 0;
    if (added === 0) {
      show("Alles schon auf der Liste.");
    } else if (added === 1) {
      show("1 Zutat auf die Einkaufsliste gesetzt.");
    } else {
      show(`${added} Zutaten auf die Einkaufsliste gesetzt.`);
    }
  }

  async function handleDelete() {
    setBusy("delete");
    const result = await deleteRecipe(recipeId);
    if (result.error) {
      setBusy(null);
      show(result.error, "error");
      return;
    }
    show("Rezept gelöscht.");
    router.push("/rezepte");
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Button
        onClick={() => setConfirmCook(true)}
        loading={busy === "cook"}
        disabled={busy !== null}
      >
        {busy !== "cook" && <Utensils className="size-4" aria-hidden />}
        Als gekocht markieren
      </Button>
      {!cookable && (
        <Button
          variant="secondary"
          onClick={handleAddMissing}
          loading={busy === "shop"}
          disabled={busy !== null}
        >
          {busy !== "shop" && <ListPlus className="size-4" aria-hidden />}
          Fehlende Zutaten auf die Liste
        </Button>
      )}
      <Button
        variant="secondary"
        onClick={() => router.push(`/rezepte/${recipeId}/bearbeiten`)}
        disabled={busy !== null}
      >
        <Pencil className="size-4" aria-hidden />
        Bearbeiten
      </Button>
      <Button
        variant="ghost"
        onClick={() => setConfirmDelete(true)}
        loading={busy === "delete"}
        disabled={busy !== null}
        className="text-danger hover:bg-danger/10 active:bg-danger/15"
      >
        {busy !== "delete" && <Trash2 className="size-4" aria-hidden />}
        Löschen
      </Button>

      <ConfirmDialog
        open={confirmCook}
        onClose={() => setConfirmCook(false)}
        title="Als gekocht markieren?"
        description="Reduziert den Vorrat um die Zutaten."
        confirmLabel="Gekocht!"
        onConfirm={handleCooked}
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Rezept löschen?"
        description="Das Rezept und seine Zutaten werden dauerhaft gelöscht. Das kann nicht rückgängig gemacht werden."
        confirmLabel="Löschen"
        danger
        onConfirm={handleDelete}
      />
    </div>
  );
}
