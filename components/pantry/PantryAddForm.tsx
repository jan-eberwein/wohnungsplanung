"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { upsertPantryItem } from "@/lib/actions/pantry";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

/** Inline-Formular, um einen Artikel manuell in den Vorrat zu legen. */
export function PantryAddForm() {
  const toast = useToast();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const parsed =
      quantity.trim() === "" ? 1 : Number(quantity.trim().replace(",", "."));
    if (Number.isNaN(parsed) || parsed < 0) {
      toast.show("Bitte gib eine gültige Menge ein.", "error");
      return;
    }

    startTransition(async () => {
      const result = await upsertPantryItem({
        name: trimmedName,
        quantity: parsed,
        unit: unit.trim() || null,
        mode: "add",
      });
      if (result.error) {
        toast.show(result.error, "error");
        return;
      }
      setName("");
      setQuantity("1");
      setUnit("");
      toast.show(`${trimmedName} ist jetzt im Vorrat.`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-3xl p-4">
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-40 flex-[2]">
          <Input
            aria-label="Name"
            placeholder="Was ist dazugekommen?"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
        <div className="w-20">
          <Input
            aria-label="Menge"
            inputMode="decimal"
            placeholder="Menge"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </div>
        <div className="w-24">
          <Input
            aria-label="Einheit"
            placeholder="Einheit"
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
          />
        </div>
        <Button type="submit" loading={isPending} disabled={!name.trim()}>
          <Plus className="size-4" aria-hidden />
          <span className="hidden sm:inline">Hinzufügen</span>
        </Button>
      </div>
    </form>
  );
}
