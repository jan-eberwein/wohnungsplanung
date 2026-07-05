import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";

export default function EinkaufenLoading() {
  return (
    <>
      <PageHeader
        title="Einkaufen & Ausgaben"
        description="Einkäufe buchen, Kosten teilen und den Saldo im Blick behalten"
      />
      <div className="space-y-6 pb-6">
        {/* Einkauf abschließen */}
        <Skeleton className="h-96 rounded-3xl" />

        {/* Saldo */}
        <div>
          <Skeleton className="mb-3 h-6 w-24" />
          <Skeleton className="h-44 rounded-3xl" />
        </div>

        {/* Monats-Statistik */}
        <div>
          <Skeleton className="mb-3 h-6 w-32" />
          <Skeleton className="h-24 rounded-3xl" />
        </div>

        {/* Historie */}
        <div>
          <Skeleton className="mb-3 h-6 w-24" />
          <div className="space-y-3">
            <Skeleton className="h-24 rounded-3xl" />
            <Skeleton className="h-24 rounded-3xl" />
            <Skeleton className="h-24 rounded-3xl" />
          </div>
        </div>
      </div>
    </>
  );
}
