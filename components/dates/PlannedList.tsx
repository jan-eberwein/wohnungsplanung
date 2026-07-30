"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CalendarPlus, Check, Trash2 } from "lucide-react";
import { deleteDate } from "@/lib/actions/dates";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatDate, formatWeekday, toDateString } from "@/lib/format";
import { dateCategoryMeta, type DateEntryFull } from "@/lib/types";

export type PlannedListProps = {
  planned: DateEntryFull[];
  onComplete: (date: DateEntryFull) => void;
};

export function PlannedList({ planned, onComplete }: PlannedListProps) {
  const router = useRouter();
  const { show } = useToast();
  const [pendingDelete, setPendingDelete] = useState<DateEntryFull | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...planned].sort((a, b) => {
      if (!a.scheduled_for) return 1;
      if (!b.scheduled_for) return -1;
      return a.scheduled_for.localeCompare(b.scheduled_for);
    });
  }, [planned]);

  const today = toDateString(new Date());

  async function handleDelete() {
    if (!pendingDelete) return;
    setBusyId(pendingDelete.id);
    const result = await deleteDate(pendingDelete.id);
    setBusyId(null);
    if (result.error) {
      show(result.error, "error");
      return;
    }
    show("Date entfernt.");
    router.refresh();
  }

  if (planned.length === 0) {
    return (
      <EmptyState
        icon={CalendarPlus}
        title="Noch nichts geplant"
        description="Wählt eine Idee aus und plant euer nächstes Date ein."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((date) => {
        const overdue = date.scheduled_for && date.scheduled_for < today;
        return (
          <div
            key={date.id}
            className="glass flex flex-col gap-3 rounded-3xl p-4 sm:flex-row sm:items-center"
          >
            <span
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-2xl"
              aria-hidden
            >
              {date.emoji ?? "💫"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{date.title}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                <CalendarClock className="size-4 shrink-0" aria-hidden />
                {date.scheduled_for ? (
                  <span className={overdue ? "text-warning" : undefined}>
                    {formatWeekday(date.scheduled_for)},{" "}
                    {formatDate(date.scheduled_for)}
                    {overdue ? " · überfällig" : ""}
                  </span>
                ) : (
                  <span>Kein Termin</span>
                )}
                <span aria-hidden>·</span>
                <span>{dateCategoryMeta(date.category).label}</span>
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                onClick={() => onComplete(date)}
                disabled={busyId === date.id}
              >
                <Check className="size-4" aria-hidden />
                Erledigt
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Date entfernen"
                onClick={() => setPendingDelete(date)}
                disabled={busyId === date.id}
                className="text-muted hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        );
      })}

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Date entfernen?"
        description={`„${pendingDelete?.title ?? ""}“ wird aus der Planung gelöscht.`}
        confirmLabel="Entfernen"
        danger
        onConfirm={handleDelete}
      />
    </div>
  );
}
