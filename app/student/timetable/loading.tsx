import { Skeleton } from "@/components/ui/skeleton";

export default function TimetableLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-64 w-full rounded-lg" />
      ))}
    </div>
  );
}
