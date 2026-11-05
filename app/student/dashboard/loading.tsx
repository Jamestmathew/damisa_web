import { StatCardsSkeleton, CardGridSkeleton } from "@/modules/student/shared/components";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full rounded-lg" />
      <StatCardsSkeleton />
      <CardGridSkeleton count={3} />
    </div>
  );
}
