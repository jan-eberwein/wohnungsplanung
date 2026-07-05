"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { PantryItem } from "@/lib/types";
import { deletePantryItem, upsertPantryItem } from "@/lib/actions/pantry";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

/** Modal, um Menge und Einheit exakt zu setzen oder den Artikel zu löschen. */
export function PantryEditModal({
  item,
  onClose,
}: {
  item: PantryItem;
  onClose: () => void;
}) {
  const toast = useToast();
  const [quantity, setQuantity] = useState(
    String(item.quantity).replace(".", ",")
  );
  const [unit, setUnit] = useState(item.unit ?? "");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const save = () => {
    const parsed = Number(quantity.trim().replace(",", "."));
    if (quantity.trim() === "" || Number.isNaN(parsed) || parsed < 0) {
      toast.show("Bitte gib eine gültige Menge ein.", "error");
      return;
    }
    startSave(async () => {
      const result = await upsertPantryItem({
        name: item.name,
        quantity: parsed,
        unit: unit.trim() || null,
      });
      if (result.error) {
        toast.show(result.error, "error");
        return;
      }
      toast.show("Gespeichert");
      onClose();
    });
  };

  const remove = () => {
    startDelete(async () => {
      const result = await deletePantryItem(item.id);
      if (result.error) {
        toast.show(result.error, "error");
        return;
      }
      toast.show(`${item.name} ist aus dem Vorrat raus.`);
      onClose();
    });
  };

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title={item.name}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={onClose}>
              Abbrechen
            </Button>
            <Button fullWidth loading={isSaving} onClick={save}>
              Speichern
            </Button>
          </div>
        }
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Menge"
            inputMode="decimal"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
          <Input
            label="Einheit"
            placeholder="z. B. g, Stk., Packung"
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            hint={
              item.unit
                ? "Leer lassen, um die bisherige Einheit zu behalten."
                : undefined
            }
          />
          <Button
            type="button"
            variant="ghost"
            loading={isDeleting}
            onClick={() => setConfirmOpen(true)}
            className="self-start text-danger hover:bg-danger/10 active:bg-danger/15"
          >
            <Trash2 className="size-4" aria-hidden />
            Aus dem Vorrat löschen
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title={`${item.name} löschen?`}
        description="Verdorben oder aufgebraucht? Dann raus damit — der Artikel verschwindet komplett aus deinem Vorrat."
        confirmLabel="Ja, löschen"
        danger
        onConfirm={remove}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
