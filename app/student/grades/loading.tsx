import { StatCardsSkeleton, TableSkeleton } from "@/modules/student/shared/components";

export default function GradesLoading() {
  return (
    <div className="space-y-6">
      <StatCardsSkeleton count={5} />
      <TableSkeleton />
    </div>
  );
}
