import { Skeleton } from "@/components/ui/Skeleton";

export default function DatesLoading() {
  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex items-center justify-between gap-4 pb-4 pt-6">
        <Skeleton className="h-8 w-28" />
      </div>
      <Skeleton className="h-12 w-full max-w-md rounded-full" />
      <Skeleton className="h-11 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-30 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
