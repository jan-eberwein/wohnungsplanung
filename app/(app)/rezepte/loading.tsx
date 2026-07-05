import { Skeleton } from "@/components/ui/Skeleton";

export default function RezepteLoading() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <div className="flex items-center justify-between gap-4 pb-4 pt-6">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-11 w-40 rounded-full" />
        </div>
        <Skeleton className="h-12 w-full max-w-md rounded-full" />
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-3xl" />
          ))}
        </div>
      </div>
      <div>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-4 h-72 rounded-3xl md:h-44" />
      </div>
    </div>
  );
}
