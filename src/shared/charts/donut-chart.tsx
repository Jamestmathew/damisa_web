import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ChartPoint } from "./bar-chart";
const colors = [
  "hsl(var(--brand-orange))",
  "hsl(var(--brand-navy))",
  "#3b82f6",
  "#10b981",
  "#a855f7",
  "#f97316",
];
export function DonutChart({
  title,
  description,
  points,
  format = "number",
}: {
  title: string;
  description?: string;
  points: ChartPoint[];
  format?: "number" | "naira";
}) {
  const valid = points.filter((p) => Number.isFinite(p.value) && p.value >= 0);
  const top = valid.slice(0, 5);
  const rest = valid.slice(5).reduce((sum, p) => sum + p.value, 0);
  const rows = rest ? [...top, { label: "Other", value: rest }] : top;
  const total = valid.reduce((sum, p) => sum + p.value, 0);
  const display = (n: number) =>
    `${format === "naira" ? "₦" : ""}${n.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <svg
            viewBox="0 0 200 200"
            className="size-44 shrink-0"
            role="img"
            aria-label={`${title}: total ${display(total)}. ${rows.map((p) => `${p.label} ${display(p.value)}`).join(", ")}`}
          >
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="currentColor"
              strokeWidth="26"
              className="text-muted"
            />
            {rows.map((p, i) => {
              const size = total ? (p.value / total) * 100 : 0;
              const start = total
                ? (rows.slice(0, i).reduce((sum, row) => sum + row.value, 0) /
                    total) *
                  100
                : 0;
              return (
                <circle
                  key={i}
                  cx="100"
                  cy="100"
                  r="70"
                  pathLength="100"
                  fill="none"
                  stroke={colors[i % colors.length]}
                  strokeWidth="26"
                  strokeDasharray={`${size} ${100 - size}`}
                  strokeDashoffset={-start}
                  transform="rotate(-90 100 100)"
                >
                  <title>
                    {p.label}: {display(p.value)}
                  </title>
                </circle>
              );
            })}
            <text
              x="100"
              y="98"
              textAnchor="middle"
              fill="currentColor"
              fontSize="16"
              fontWeight="600"
            >
              {display(total)}
            </text>
            <text
              x="100"
              y="119"
              textAnchor="middle"
              fill="currentColor"
              fontSize="11"
            >
              Total
            </text>
          </svg>
          <ul className="min-w-0 flex-1 space-y-2 text-sm">
            {rows.map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className="mt-1 size-3 shrink-0 rounded-full"
                  style={{ background: colors[i % colors.length] }}
                />
                <span className="min-w-0 flex-1 break-words">{p.label}</span>
                <span className="shrink-0 font-medium">{display(p.value)}</span>
              </li>
            ))}
            {total === 0 && (
              <li className="text-muted-foreground">No recorded values yet.</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
