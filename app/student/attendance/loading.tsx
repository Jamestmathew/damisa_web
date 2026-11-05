import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/modules/student/shared/components";

export default function AttendanceLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 max-w-sm rounded-lg" />
      <TableSkeleton />
    </div>
  );
}
