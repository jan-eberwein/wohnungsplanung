"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  createCategory,
  deleteCategory,
  renameCategory,
} from "@/lib/actions/categories";
import type { Category } from "@/lib/types";

const RENAME_FORM_ID = "rename-category-form";

/** Kategorien-Sektion: Liste mit Umbenennen/Löschen und Zeile zum Anlegen. */
export function CategoryManager({ categories }: { categories: Category[] }) {
  const { show } = useToast();

  const [renameTarget, setRenameTarget] = useState<Category | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [newName, setNewName] = useState("");

  const [renamePending, startRename] = useTransition();
  const [createPending, startCreate] = useTransition();

  const openRename = (category: Category) => {
    setRenameTarget(category);
    setRenameValue(category.name);
  };

  const submitRename = () => {
    if (!renameTarget || renamePending) return;
    startRename(async () => {
      const result = await renameCategory(renameTarget.id, renameValue);
      if (result.error) {
        show(result.error, "error");
      } else {
        show("Kategorie umbenannt.");
        setRenameTarget(null);
      }
    });
  };

  const handleDelete = (category: Category) => {
    void deleteCategory(category.id).then((result) => {
      if (result.error) show(result.error, "error");
      else show("Kategorie gelöscht.");
    });
  };

  const submitCreate = () => {
    if (!newName.trim() || createPending) return;
    startCreate(async () => {
      const result = await createCategory(newName);
      if (result.error) {
        show(result.error, "error");
      } else {
        show("Kategorie erstellt.");
        setNewName("");
      }
    });
  };

  return (
    <GlassCard className="p-5">
      <h2 className="text-base font-semibold">Kategorien verwalten</h2>
      <p className="mt-1 text-sm text-muted">
        Kategorien sortieren Einkaufsliste und Vorrat.
      </p>

      {categories.length === 0 ? (
        <p className="py-4 text-sm text-muted">Noch keine Kategorien.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center gap-3 py-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface text-foreground">
                <CategoryIcon icon={category.icon} className="size-4" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {category.name}
              </span>
              <button
                type="button"
                aria-label={`${category.name} umbenennen`}
                onClick={() => openRename(category)}
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                <Pencil className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                aria-label={`${category.name} löschen`}
                onClick={() => setDeleteTarget(category)}
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        className="mt-3 flex items-center gap-2 border-t border-line pt-4"
        onSubmit={(event) => {
          event.preventDefault();
          submitCreate();
        }}
      >
        <Input
          aria-label="Neue Kategorie"
          placeholder="Neue Kategorie"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
        />
        <Button
          type="submit"
          loading={createPending}
          disabled={!newName.trim()}
          className="shrink-0"
        >
          <Plus className="size-4" aria-hidden />
          Hinzufügen
        </Button>
      </form>

      <Modal
        open={renameTarget !== null}
        onClose={() => setRenameTarget(null)}
        title="Kategorie umbenennen"
        footer={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setRenameTarget(null)}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              form={RENAME_FORM_ID}
              fullWidth
              loading={renamePending}
              disabled={!renameValue.trim()}
            >
              Speichern
            </Button>
          </div>
        }
      >
        <form
          id={RENAME_FORM_ID}
          onSubmit={(event) => {
            event.preventDefault();
            submitRename();
          }}
        >
          <Input
            label="Name"
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            autoFocus
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title={
          deleteTarget ? `„${deleteTarget.name}“ löschen?` : "Kategorie löschen?"
        }
        description="Artikel behalten ihre Einträge, verlieren nur die Kategorie."
        confirmLabel="Löschen"
        danger
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget);
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </GlassCard>
  );
}
