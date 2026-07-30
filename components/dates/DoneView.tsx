"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Heart, ImageIcon, LayoutGrid } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Stars } from "@/components/dates/Stars";
import { formatDate, toDateString } from "@/lib/format";
import type { DateEntryFull } from "@/lib/types";

export type DoneViewProps = {
  done: DateEntryFull[];
};

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const monthYearFormat = new Intl.DateTimeFormat("de-AT", {
  month: "long",
  year: "numeric",
});

/** completed_on (oder ersatzweise created_at) als lokale YYYY-MM-DD */
function dayKey(date: DateEntryFull): string {
  return date.completed_on ?? toDateString(new Date(date.created_at));
}

export function DoneView({ done }: DoneViewProps) {
  const [mode, setMode] = useState<"galerie" | "kalender">("galerie");

  const sorted = useMemo(
    () => [...done].sort((a, b) => dayKey(b).localeCompare(dayKey(a))),
    [done]
  );

  if (done.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Noch keine Erinnerungen"
        description="Sobald ihr ein geplantes Date als erledigt eintragt, erscheint es hier mit Fotos und Notizen."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        aria-label="Ansicht wählen"
        value={mode}
        onChange={setMode}
        className="max-w-xs"
        options={[
          {
            value: "galerie",
            label: (
              <span className="inline-flex items-center gap-1.5">
                <LayoutGrid className="size-4" aria-hidden />
                Galerie
              </span>
            ),
          },
          {
            value: "kalender",
            label: (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden />
                Kalender
              </span>
            ),
          },
        ]}
      />

      {mode === "galerie" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((date) => (
            <MemoryCard key={date.id} date={date} />
          ))}
        </div>
      ) : (
        <CalendarView done={sorted} />
      )}
    </div>
  );
}

function MemoryCard({ date }: { date: DateEntryFull }) {
  const cover = date.photos.find((photo) => photo.url)?.url ?? null;

  return (
    <Link
      href={`/dates/${date.id}`}
      className="group block rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="glass overflow-hidden rounded-3xl transition-transform duration-150 group-active:scale-[0.98]">
        <div className="relative aspect-video bg-foreground/5">
          {cover ? (
            <Image
              src={cover}
              alt={date.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl">
              <span aria-hidden>{date.emoji ?? "💫"}</span>
            </div>
          )}
          {date.photos.length > 1 && (
            <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
              <ImageIcon className="size-3" aria-hidden />
              {date.photos.length}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5 p-4">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>
              {date.emoji ?? "💫"}
            </span>
            <h3 className="min-w-0 flex-1 truncate text-base font-semibold">
              {date.title}
            </h3>
          </div>
          <div className="flex items-center justify-between gap-2 text-sm text-muted">
            <span>{formatDate(dayKey(date))}</span>
            <Stars value={date.rating} size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
}

function CalendarView({ done }: { done: DateEntryFull[] }) {
  const [month, setMonth] = useState(() => {
    const first = done[0] ? new Date(dayKey(done[0]) + "T00:00:00") : new Date();
    return new Date(first.getFullYear(), first.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Map YYYY-MM-DD -> Dates an diesem Tag
  const byDay = useMemo(() => {
    const map = new Map<string, DateEntryFull[]>();
    for (const date of done) {
      const key = dayKey(date);
      const list = map.get(key) ?? [];
      list.push(date);
      map.set(key, list);
    }
    return map;
  }, [done]);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingBlanks = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const todayKey = toDateString(new Date());

  const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const monthMemories = done.filter((date) => dayKey(date).startsWith(monthPrefix));
  const visible = selectedDay
    ? done.filter((date) => dayKey(date) === selectedDay)
    : monthMemories;

  function changeMonth(delta: number) {
    setMonth(new Date(year, monthIndex + delta, 1));
    setSelectedDay(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="glass rounded-3xl p-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Vorheriger Monat"
            className="flex size-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <p className="text-sm font-semibold capitalize">
            {monthYearFormat.format(month)}
          </p>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Nächster Monat"
            className="flex size-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-muted">
          {WEEKDAYS.map((weekday) => (
            <div key={weekday} className="py-1">
              {weekday}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: leadingBlanks }, (_, index) => (
            <div key={`blank-${index}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const key = `${monthPrefix}-${String(day).padStart(2, "0")}`;
            const entries = byDay.get(key);
            const isToday = key === todayKey;
            const isSelected = key === selectedDay;

            if (!entries) {
              return (
                <div
                  key={key}
                  className={`flex aspect-square items-center justify-center rounded-xl text-sm ${
                    isToday ? "font-bold text-accent" : "text-muted"
                  }`}
                >
                  {day}
                </div>
              );
            }

            return (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setSelectedDay((current) => (current === key ? null : key))
                }
                aria-label={`${entries.length} Date(s) am ${day}.`}
                aria-pressed={isSelected}
                className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors ${
                  isSelected
                    ? "bg-accent text-accent-contrast"
                    : "bg-accent/10 hover:bg-accent/20"
                }`}
              >
                <span aria-hidden className="text-base leading-none">
                  {entries[0].emoji ?? "💫"}
                </span>
                <span
                  className={`mt-0.5 text-[10px] leading-none ${
                    isSelected ? "text-accent-contrast" : "text-muted"
                  }`}
                >
                  {day}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <button
          type="button"
          onClick={() => setSelectedDay(null)}
          className="self-start text-sm font-medium text-accent"
        >
          ← Ganzen Monat anzeigen
        </button>
      )}

      {visible.length === 0 ? (
        <p className="px-1 text-sm text-muted">
          In diesem Monat gibt es noch keine Erinnerungen.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visible.map((date) => (
            <MemoryCard key={date.id} date={date} />
          ))}
        </div>
      )}
    </div>
  );
}
