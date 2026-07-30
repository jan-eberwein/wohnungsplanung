import Link from "next/link";
import { ChevronRight, Heart } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatDate, formatWeekday } from "@/lib/format";
import type { DateEntry } from "@/lib/types";

export type NextDateCardProps = {
  next: DateEntry | null;
};

export function NextDateCard({ next }: NextDateCardProps) {
  return (
    <Link href="/dates" className="group block">
      <GlassCard className="flex items-center gap-4 p-5 transition-transform duration-150 group-active:scale-[0.99]">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-xl"
          aria-hidden
        >
          {next?.emoji ?? <Heart className="size-5 text-accent" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">
            {next ? "Nächstes Date" : "Dates"}
          </span>
          <span className="block truncate text-sm text-muted">
            {next && next.scheduled_for
              ? `${next.title} · ${formatWeekday(next.scheduled_for)}, ${formatDate(next.scheduled_for)}`
              : "Plant euer nächstes gemeinsames Date"}
          </span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
      </GlassCard>
    </Link>
  );
}
