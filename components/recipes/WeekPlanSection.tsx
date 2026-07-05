"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ListPlus, Plus, X } from "lucide-react";
import {
  generateWeekShoppingList,
  planRecipe,
  unplanRecipe,
} from "@/lib/actions/recipes";
import { toDateString } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { Recipe, WeekPlanEntryFull } from "@/lib/types";

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const dayFormat = new Intl.DateTimeFormat("de-AT", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
});

export type WeekPlanSectionProps = {
  /** Montag der Woche als YYYY-MM-DD */
  weekStart: string;
  /** Heutiges Datum als YYYY-MM-DD (server-seitig berechnet) */
  today: string;
  entries: WeekPlanEntryFull[];
  recipes: Pick<Recipe, "id" | "title">[];
};

export function WeekPlanSection({
  weekStart,
  today,
  entries,
  recipes,
}: WeekPlanSectionProps) {
  const { show } = useToast();
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [planningId, setPlanningId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const days = useMemo(() => {
    const base = new Date(`${weekStart}T00:00:00`);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(base);
      date.setDate(base.getDate() + index);
      return toDateString(date);
    });
  }, [weekStart]);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, WeekPlanEntryFull[]>();
    for (const entry of entries) {
      const list = map.get(entry.plan_date) ?? [];
      list.push(entry);
      map.set(entry.plan_date, list);
    }
    return map;
  }, [entries]);

  async function handlePlan(recipeId: string) {
    if (!modalDate || planningId) return;
    setPlanningId(recipeId);
    const result = await planRecipe(recipeId, modalDate);
    setPlanningId(null);
    if (result.error) {
      show(result.error, "error");
      return;
    }
    setModalDate(null);
    show("Rezept eingeplant.");
  }

  async function handleUnplan(entry: WeekPlanEntryFull) {
    if (removingId) return;
    setRemovingId(entry.id);
    const result = await unplanRecipe(entry.id);
    setRemovingId(null);
    if (result.error) show(result.error, "error");
  }

  async function handleGenerate() {
    setGenerating(true);
    const result = await generateWeekShoppingList(weekStart);
    setGenerating(false);
    if (result.error) {
      show(result.error, "error");
      return;
    }
    const added = result.added ?? 0;
    if (added === 0) {
      show("Nichts zu ergänzen – alles vorrätig oder schon auf der Liste.");
    } else if (added === 1) {
      show("1 Artikel auf die Einkaufsliste gesetzt.");
    } else {
      show(`${added} Artikel auf die Einkaufsliste gesetzt.`);
    }
  }

  return (
    <section aria-label="Wochenplan" className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <CalendarDays className="size-5 text-muted" aria-hidden />
        <h2 className="text-lg font-semibold">Wochenplan</h2>
      </div>
      <GlassCard className="flex flex-col gap-4 p-4 md:p-5">
        <div className="flex flex-col gap-2 md:grid md:grid-cols-7">
          {days.map((date, index) => {
            const isToday = date === today;
            const dayEntries = entriesByDate.get(date) ?? [];
            return (
              <div
                key={date}
                className={[
                  "rounded-2xl border p-2",
                  isToday
                    ? "border-accent/40 bg-accent/10"
                    : "border-line bg-surface",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={[
                      "text-xs font-semibold",
                      isToday ? "text-accent" : "text-muted",
                    ].join(" ")}
                  >
                    {WEEKDAY_LABELS[index]}{" "}
                    {Number(date.slice(8, 10))}.
                  </span>
                  <button
                    type="button"
                    onClick={() => setModalDate(date)}
                    aria-label={`Rezept für ${dayFormat.format(new Date(`${date}T00:00:00`))} planen`}
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
                  >
                    <Plus className="size-4" aria-hidden />
                  </button>
                </div>
                {dayEntries.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5 md:flex-col">
                    {dayEntries.map((entry) => (
                      <span
                        key={entry.id}
                        className="inline-flex max-w-full items-center gap-1 rounded-full bg-accent/15 py-0.5 pl-2.5 pr-1 text-xs font-medium text-accent"
                      >
                        <Link
                          href={`/rezepte/${entry.recipe.id}`}
                          className="min-w-0 truncate hover:underline"
                        >
                          {entry.recipe.title}
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleUnplan(entry)}
                          disabled={removingId === entry.id}
                          aria-label={`${entry.recipe.title} aus dem Plan entfernen`}
                          className="flex size-5 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-accent/20 disabled:opacity-50"
                        >
                          <X className="size-3" aria-hidden />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <Button
          variant="secondary"
          onClick={handleGenerate}
          loading={generating}
          className="md:self-start"
        >
          {!generating && <ListPlus className="size-4" aria-hidden />}
          Fehlendes für die Woche auf die Liste
        </Button>
      </GlassCard>

      <Modal
        open={modalDate !== null}
        onClose={() => setModalDate(null)}
        title={
          modalDate
            ? `Rezept für ${dayFormat.format(new Date(`${modalDate}T00:00:00`))}`
            : undefined
        }
      >
        {recipes.length === 0 ? (
          <p className="text-sm text-muted">
            Noch keine Rezepte vorhanden. Legt zuerst ein Rezept an.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recipes.map((recipe) => (
              <li key={recipe.id}>
                <button
                  type="button"
                  onClick={() => handlePlan(recipe.id)}
                  disabled={planningId !== null}
                  className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-surface-strong disabled:opacity-50"
                >
                  {planningId === recipe.id ? "Wird eingeplant …" : recipe.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </section>
  );
}
