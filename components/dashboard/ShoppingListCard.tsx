import Link from "next/link";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export type ShoppingListCardProps = {
  openCount: number;
};

export function ShoppingListCard({ openCount }: ShoppingListCardProps) {
  const label =
    openCount === 0
      ? "Keine offenen Artikel"
      : openCount === 1
        ? "1 offener Artikel"
        : `${openCount} offene Artikel`;

  return (
    <Link href="/einkaufsliste" className="group block">
      <GlassCard className="flex items-center gap-4 p-5 transition-transform duration-150 group-active:scale-[0.99]">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent/15">
          <ShoppingCart className="size-5 text-accent" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">Einkaufsliste</span>
          <span className="block truncate text-sm text-muted">{label}</span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
      </GlassCard>
    </Link>
  );
}
