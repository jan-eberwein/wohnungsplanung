import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-52" />
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
        {/* Saldo-Karte */}
        <GlassCard className="p-5">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="mt-4 h-4 w-44" />
          <Skeleton className="mt-2 h-9 w-32" />
          <div className="mt-5 flex items-center gap-3">
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="h-1.5 flex-1 rounded-full" />
            <Skeleton className="size-12 rounded-full" />
          </div>
          <Skeleton className="mt-5 h-11 w-full rounded-full" />
        </GlassCard>

        {/* Vorrats-Karte */}
        <GlassCard className="p-5">
          <Skeleton className="h-4 w-36" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </GlassCard>

        {/* Rezept-Vorschläge */}
        <section className="md:col-span-2">
          <Skeleton className="h-5 w-64" />
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((index) => (
              <GlassCard key={index} className="p-5">
                <Skeleton className="h-5 w-3/4" />
                <div className="mt-3 flex gap-1.5">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Einkaufslisten-Karte */}
        <GlassCard className="flex items-center gap-4 p-5 md:col-span-2">
          <Skeleton className="size-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
