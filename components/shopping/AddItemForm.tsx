"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import type { Category } from "@/lib/types";
import type { ShoppingItemInput } from "@/lib/actions/shopping";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { GlassCard } from "@/components/ui/GlassCard";

/** Wandelt die Mengen-Eingabe ("1,5") in eine Zahl um; ungültige Werte werden verworfen. */
export function parseQuantity(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function AddItemForm({
  categories,
  onAdd,
}: {
  categories: Category[];
  onAdd: (input: ShoppingItemInput) => void;
}) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      nameRef.current?.focus();
      return;
    }

    onAdd({
      name: trimmed,
      quantity: parseQuantity(quantity),
      unit: unit.trim() || null,
      categoryId: categoryId || null,
    });

    setName("");
    setQuantity("");
    setUnit("");
    nameRef.current?.focus();
  };

  return (
    <GlassCard className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Input
            ref={nameRef}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Was brauchst du?"
            aria-label="Artikelname"
            autoComplete="off"
            enterKeyHint="done"
          />
          <button
            type="submit"
            aria-label="Artikel hinzufügen"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast transition-transform duration-150 hover:bg-accent/90 active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Plus className="size-5" aria-hidden />
          </button>
        </div>
        <div className="flex gap-2">
          <Input
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="Menge"
            aria-label="Menge"
            inputMode="decimal"
            autoComplete="off"
            className="w-full"
          />
          <Input
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            placeholder="Einheit"
            aria-label="Einheit"
            autoComplete="off"
            className="w-full"
          />
          <Select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            aria-label="Kategorie"
          >
            <option value="">Kategorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
      </form>
    </GlassCard>
  );
}
