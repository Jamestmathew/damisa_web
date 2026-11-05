import { StatCardsSkeleton, TableSkeleton } from "@/shared/components";

export default function Loading() {
  return (
    <div className="space-y-6">
      <StatCardsSkeleton count={4} />
      <TableSkeleton rows={3} />
    </div>
  );
}
