import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";

export default function EinkaufslisteLoading() {
  return (
    <>
      <PageHeader title="Einkaufsliste" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-32 rounded-3xl" />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5 px-1">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-36 rounded-3xl" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5 px-1">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-24 rounded-3xl" />
        </div>
      </div>
    </>
  );
}
