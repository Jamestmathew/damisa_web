import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "@/modules/student/shared/components";

export default function ProgressLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 max-w-sm rounded-lg" />
      <CardGridSkeleton count={2} />
    </div>
  );
}
