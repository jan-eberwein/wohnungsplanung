"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { addPantryItemToShopping } from "@/lib/actions/pantry";

export type AddToShoppingButtonProps = {
  pantryItemId: string;
};

/** Setzt einen knappen Vorrats-Artikel mit einem Klick auf die Einkaufsliste. */
export function AddToShoppingButton({
  pantryItemId,
}: AddToShoppingButtonProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { show } = useToast();

  function handleClick() {
    startTransition(async () => {
      const result = await addPantryItemToShopping(pantryItemId);
      if (result.error) {
        show(result.error, "error");
        return;
      }
      if (result.alreadyListed) {
        show("Steht schon auf der Liste");
        return;
      }
      show("Auf die Liste gesetzt.");
      router.refresh();
    });
  }

  return (
    <Button
      size="sm"
      variant="secondary"
      loading={pending}
      onClick={handleClick}
      className="shrink-0"
    >
      {!pending && <Plus className="size-4 shrink-0" aria-hidden />}
      Auf die Liste
    </Button>
  );
}
