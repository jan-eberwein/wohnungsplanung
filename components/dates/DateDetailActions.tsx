"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { deleteDate } from "@/lib/actions/dates";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CompleteDateModal } from "@/components/dates/CompleteDateModal";
import { useToast } from "@/components/ui/Toast";
import type { DateEntryFull } from "@/lib/types";

export function DateDetailActions({ date }: { date: DateEntryFull }) {
  const router = useRouter();
  const { show } = useToast();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    const result = await deleteDate(date.id);
    if (result.error) {
      setBusy(false);
      show(result.error, "error");
      return;
    }
    show("Erinnerung gelöscht.");
    router.push("/dates");
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => setEditing(true)} disabled={busy}>
        <Pencil className="size-4" aria-hidden />
        Bearbeiten
      </Button>
      <Button
        variant="ghost"
        onClick={() => setConfirmDelete(true)}
        loading={busy}
        className="text-danger hover:bg-danger/10 active:bg-danger/15"
      >
        {!busy && <Trash2 className="size-4" aria-hidden />}
        Löschen
      </Button>

      <CompleteDateModal
        open={editing}
        date={date}
        onClose={() => setEditing(false)}
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Erinnerung löschen?"
        description="Das Date und alle Fotos werden dauerhaft gelöscht. Das kann nicht rückgängig gemacht werden."
        confirmLabel="Löschen"
        danger
        onConfirm={handleDelete}
      />
    </div>
  );
}
