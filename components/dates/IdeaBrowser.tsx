"use client";

import { useMemo, useState } from "react";
import { Plus, Search, SearchX, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  DATE_CATEGORIES,
  dateCategoryMeta,
  normalizeName,
  type DateCategoryKey,
  type DateIdea,
} from "@/lib/types";
import type { PlanTarget } from "@/components/dates/PlanDateModal";

export type IdeaBrowserProps = {
  ideas: DateIdea[];
  onPlan: (target: PlanTarget) => void;
  onAddIdea: () => void;
};

type Filter = DateCategoryKey | "alle";

export function IdeaBrowser({ ideas, onPlan, onAddIdea }: IdeaBrowserProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("alle");

  // Nur Kategorien anzeigen, zu denen es auch Ideen gibt.
  const activeCategories = useMemo(() => {
    const present = new Set(ideas.map((idea) => idea.category));
    return DATE_CATEGORIES.filter((category) => present.has(category.key));
  }, [ideas]);

  const filtered = useMemo(() => {
    const normalizedQuery = normalizeName(query);
    return ideas.filter((idea) => {
      if (filter !== "alle" && idea.category !== filter) return false;
      if (normalizedQuery && !normalizeName(idea.title).includes(normalizedQuery)) {
        return false;
      }
      return true;
    });
  }, [ideas, filter, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ideen durchsuchen …"
          aria-label="Ideen durchsuchen"
          className="min-h-11 w-full rounded-2xl border border-line bg-surface pl-11 pr-4 text-base text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/25"
        />
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <FilterChip
          active={filter === "alle"}
          onClick={() => setFilter("alle")}
          label="Alle"
          emoji="✨"
        />
        {activeCategories.map((category) => (
          <FilterChip
            key={category.key}
            active={filter === category.key}
            onClick={() => setFilter(category.key)}
            label={category.label}
            emoji={category.emoji}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <button
          type="button"
          onClick={onAddIdea}
          className="flex min-h-[7.5rem] flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-line bg-surface p-4 text-muted transition-colors hover:bg-surface-strong hover:text-foreground"
        >
          <Plus className="size-6" aria-hidden />
          <span className="text-sm font-medium">Eigene Idee</span>
        </button>

        {filtered.map((idea) => (
          <button
            key={idea.id}
            type="button"
            onClick={() =>
              onPlan({
                ideaId: idea.id,
                title: idea.title,
                emoji: idea.emoji,
                category: idea.category,
              })
            }
            className="glass group flex min-h-[7.5rem] flex-col gap-2 rounded-3xl p-4 text-left transition-transform duration-150 hover:bg-surface-strong active:scale-[0.97]"
          >
            <span className="text-3xl" aria-hidden>
              {idea.emoji ?? "💫"}
            </span>
            <span className="line-clamp-2 text-sm font-semibold leading-snug">
              {idea.title}
            </span>
            <span className="mt-auto flex items-center gap-1 text-xs text-muted">
              {dateCategoryMeta(idea.category).label}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={query ? SearchX : Sparkles}
          title={query ? "Keine Treffer" : "Keine Ideen"}
          description={
            query
              ? "Probiert einen anderen Suchbegriff oder Filter."
              : "Fügt eure erste eigene Date-Idee hinzu."
          }
        />
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  emoji,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  emoji: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-accent text-accent-contrast"
          : "border border-line bg-surface text-muted hover:text-foreground"
      }`}
    >
      <span aria-hidden>{emoji}</span>
      {label}
    </button>
  );
}
