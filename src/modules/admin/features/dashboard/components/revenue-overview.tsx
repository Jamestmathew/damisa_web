import { DataBarChart } from "@/shared/charts/bar-chart";
import type { RevenuePoint } from "../types";
export function RevenueOverview({ points }: { points: RevenuePoint[] }) {
  return (
    <DataBarChart
      title="Company income"
      description="Confirmed manual income by earned date, last six months"
      format="naira"
      tone="orange"
      points={points.map((p) => ({ label: p.month, value: p.amountNaira }))}
    />
  );
}
