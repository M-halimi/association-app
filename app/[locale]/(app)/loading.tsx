import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-border bg-card p-4"
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-7 w-32" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Skeleton className="mb-4 h-5 w-40" />
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-b-0"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-28 flex-1" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}