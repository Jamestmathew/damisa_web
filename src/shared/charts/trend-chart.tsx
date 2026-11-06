import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartPoint } from "./bar-chart";
export function TrendChart({
  title,
  description,
  points,
  format = "number",
}: {
  title: string;
  description?: string;
  points: ChartPoint[];
  format?: "number" | "naira" | "percent";
}) {
  const rows = points
    .filter((p) => Number.isFinite(p.value) && p.value >= 0)
    .slice(-12);
  const max = Math.max(...rows.map((p) => p.value), 1);
  const display = (n: number) =>
    new Intl.NumberFormat("en-NG", {
      maximumFractionDigits: 0,
      notation: n >= 1e6 ? "compact" : "standard",
    }).format(n);
  const value = (n: number) =>
    `${format === "naira" ? "₦" : ""}${display(n)}${format === "percent" ? "%" : ""}`;
  const coords = rows.map((p, i) => ({
    x: 60 + (i * 500) / Math.max(rows.length - 1, 1),
    y: 180 - (140 * p.value) / max,
    ...p,
  }));
  const path = coords.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        {!rows.length ? (
          <p className="p-8 text-sm text-muted-foreground">
            No records to chart yet.
          </p>
        ) : (
          <figure aria-label={title} className="overflow-x-auto">
            <svg
              viewBox="0 0 620 230"
              className="min-w-[440px] w-full"
              role="img"
              aria-label={`${title}: ${rows.map((p) => `${p.label} ${value(p.value)}`).join(", ")}`}
            >
              {[0, 0.5, 1].map((f) => (
                <g key={f}>
                  <line
                    x1="60"
                    x2="560"
                    y1={180 - f * 140}
                    y2={180 - f * 140}
                    stroke="currentColor"
                    className="text-border"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="52"
                    y={184 - f * 140}
                    textAnchor="end"
                    fontSize="10"
                    fill="currentColor"
                    className="text-muted-foreground"
                  >
                    {value(max * f)}
                  </text>
                </g>
              ))}
              <path
                d={`${path} L${coords.at(-1)?.x},180 L60,180 Z`}
                fill="hsl(var(--brand-orange))"
                fillOpacity=".15"
              />
              <path
                d={path}
                fill="none"
                stroke="hsl(var(--brand-orange))"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {coords.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="hsl(var(--brand-orange))"
                  >
                    <title>
                      {p.label}: {value(p.value)}
                    </title>
                  </circle>
                  <text
                    x={p.x}
                    y="210"
                    textAnchor="middle"
                    fontSize="11"
                    fill="currentColor"
                    className="text-muted-foreground"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </figure>
        )}
      </CardContent>
    </Card>
  );
}
