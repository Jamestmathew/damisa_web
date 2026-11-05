import { DataBarChart } from "@/shared/charts/bar-chart";
import type { EnrollmentPoint } from "../types";
export function EnrollmentOverview({ points }: { points: EnrollmentPoint[] }) {
  return (
    <DataBarChart
      title="Student registrations"
      description="Current student accounts by creation month"
      points={points.map((p) => ({ label: p.month, value: p.count }))}
    />
  );
}
