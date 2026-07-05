import { GlassCard } from "@/components/ui/GlassCard";
import { formatEuro } from "@/lib/format";
import type { MonthStats } from "@/lib/types";

export type MonthStatsCardProps = {
  stats: MonthStats;
};

/** Statistik für den aktuellen Kalendermonat */
export function MonthStatsCard({ stats }: MonthStatsCardProps) {
  const entries = [
    { label: "Gesamt", value: formatEuro(stats.total) },
    { label: "Einkäufe", value: String(stats.count) },
    { label: "Ø pro Einkauf", value: formatEuro(stats.average) },
  ];

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Dieser Monat</h2>
      <GlassCard className="grid grid-cols-3 divide-x divide-line">
        {entries.map((entry) => (
          <div
            key={entry.label}
            className="flex min-w-0 flex-col items-center gap-1 px-2 py-4 text-center"
          >
            <span className="text-xs font-medium text-muted">
              {entry.label}
            </span>
            <span className="w-full truncate text-base font-bold sm:text-lg">
              {entry.value}
            </span>
          </div>
        ))}
      </GlassCard>
    </section>
  );
}
