import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";

export default function VorratLoading() {
  return (
    <>
      <PageHeader title="Vorrat" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-20 rounded-3xl" />
        <Skeleton className="h-11" />
        <div className="flex flex-col gap-px overflow-hidden rounded-3xl">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-none" />
          ))}
        </div>
      </div>
    </>
  );
}
