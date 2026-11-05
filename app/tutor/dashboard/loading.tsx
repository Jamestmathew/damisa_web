import { StatCardsSkeleton, CardGridSkeleton } from "@/shared/components";

export default function Loading() {
  return (
    <div className="space-y-6">
      <StatCardsSkeleton count={4} />
      <CardGridSkeleton count={3} />
    </div>
  );
}
