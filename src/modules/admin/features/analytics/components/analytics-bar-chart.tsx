import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { AnalyticsTrendPoint } from "../types";

export function AnalyticsBarChart({ title, points }: { title: string; points: AnalyticsTrendPoint[] }) {
  const max = Math.max(...points.map((p) => p.value), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-40 items-end gap-4 px-2">
          {points.map((point) => (
            <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end">
                <div
                  className="w-full rounded-t-md bg-primary transition-all"
                  style={{ height: `${(point.value / max) * 100}%` }}
                  aria-label={`${point.label}: ${point.value}`}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{point.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
