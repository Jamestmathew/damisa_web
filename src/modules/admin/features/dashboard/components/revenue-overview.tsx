import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { RevenuePoint } from "../types";

function formatNaira(amount: number) {
  return `₦${(amount / 1_000_000).toFixed(1)}M`;
}

export function RevenueOverview({ points }: { points: RevenuePoint[] }) {
  const max = Math.max(...points.map((p) => p.amountNaira), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-40 items-end gap-4 px-2">
          {points.map((point) => (
            <div key={point.month} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end">
                <div
                  className="w-full rounded-t-md bg-success transition-all"
                  style={{ height: `${(point.amountNaira / max) * 100}%` }}
                  aria-label={`${point.month}: ${formatNaira(point.amountNaira)}`}
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
