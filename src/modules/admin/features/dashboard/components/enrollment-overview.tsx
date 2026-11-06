import { TrendChart } from "@/shared/charts/trend-chart";
import type { EnrollmentPoint } from "../types";
export function EnrollmentOverview({ points }: { points: EnrollmentPoint[] }) {
  return (
    <TrendChart
      title="Student registrations"
      description="Current student accounts by creation month"
      points={points.map((p) => ({ label: p.month, value: p.count }))}
    />
  );
}
