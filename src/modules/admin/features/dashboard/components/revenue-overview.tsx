import { TrendChart } from "@/shared/charts/trend-chart";
import type { RevenuePoint } from "../types";
export function RevenueOverview({ points }: { points: RevenuePoint[] }) {
  return (
    <TrendChart
      title="Company income"
      description="Confirmed manual income by earned date, last six months"
      format="naira"
      points={points.map((p) => ({ label: p.month, value: p.amountNaira }))}
    />
  );
}
