import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { EnrollmentPoint } from "../types";

export function EnrollmentOverview({ points }: { points: EnrollmentPoint[] }) {
  const max = Math.max(...points.map((p) => p.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Enrollment Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-40 items-end gap-4 px-2">
          {points.map((point) => (
            <div key={point.month} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end">
                <div
                  className="w-full rounded-t-md bg-primary transition-all"
                  style={{ height: `${(point.count / max) * 100}%` }}
                  aria-label={`${point.month}: ${point.count} students`}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{point.month}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
