"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Category, ShoppingItemFull } from "@/lib/types";
import type { ShoppingItemInput } from "@/lib/actions/shopping";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { parseQuantity } from "./AddItemForm";

export function EditItemModal({
  item,
  categories,
  onClose,
  onSave,
  onDelete,
}: {
  item: ShoppingItemFull | null;
  categories: Category[];
  onClose: () => void;
  onSave: (id: string, input: ShoppingItemInput) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [prevItem, setPrevItem] = useState<ShoppingItemFull | null>(null);

  // Formular mit den Werten des ausgewählten Artikels befüllen
  // (State-Anpassung während des Renderns statt in einem Effect).
  if (item !== prevItem) {
    setPrevItem(item);
    if (item) {
      setName(item.name);
      setQuantity(
        item.quantity !== null ? String(item.quantity).replace(".", ",") : ""
      );
      setUnit(item.unit ?? "");
      setCategoryId(item.category_id ?? "");
      setNameError(undefined);
      setConfirmDelete(false);
    }
  }

  const handleSave = () => {
    if (!item) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Bitte einen Namen eingeben.");
      return;
    }
    onSave(item.id, {
      name: trimmed,
      quantity: parseQuantity(quantity),
      unit: unit.trim() || null,
      categoryId: categoryId || null,
    });
    onClose();
  };

  return (
    <>
      <Modal
        open={item !== null}
        onClose={onClose}
        title="Artikel bearbeiten"
        footer={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setConfirmDelete(true)}
              className="shrink-0 text-danger"
            >
              <Trash2 className="size-4" aria-hidden />
              Löschen
            </Button>
            <Button fullWidth onClick={handleSave}>
              Speichern
            </Button>
          </div>
        }
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSave();
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (nameError) setNameError(undefined);
            }}
            error={nameError}
            autoComplete="off"
          />
          <div className="flex gap-3">
            <Input
              label="Menge"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="z. B. 500"
              inputMode="decimal"
              autoComplete="off"
            />
            <Input
              label="Einheit"
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              placeholder="z. B. g"
              autoComplete="off"
            />
          </div>
          <Select
            label="Kategorie"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="">Ohne Kategorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          {/* Ermöglicht Absenden per Enter */}
          <button type="submit" hidden aria-hidden />
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="Artikel löschen?"
        description={
          item ? `„${item.name}“ wird von der Einkaufsliste entfernt.` : undefined
        }
        confirmLabel="Löschen"
        danger
        onConfirm={() => {
          if (item) onDelete(item.id);
          onClose();
        }}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
