import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
export interface ChartPoint {
  label: string;
  value: number;
}
export function DataBarChart({
  title,
  description,
  points,
  format = "number",
  tone = "navy",
  showDataTable = true,
}: {
  title: string;
  description?: string;
  points: ChartPoint[];
  format?: "number" | "naira" | "percent";
  tone?: "navy" | "orange";
  showDataTable?: boolean;
}) {
  const rows = points
    .filter((p) => Number.isFinite(p.value) && p.value >= 0)
    .slice(0, 8);
  const maximum = Math.max(
    ...rows.map((p) => p.value),
    format === "percent" ? 100 : 1,
  );
  const display = (value: number) =>
    format === "naira"
      ? new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
          maximumFractionDigits: 0,
          notation: value >= 1000000 ? "compact" : "standard",
        }).format(value)
      : `${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 1 }).format(value)}${format === "percent" ? "%" : ""}`;
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        {!rows.length ? (
          <div className="flex h-40 items-center justify-center rounded-lg bg-muted/50 text-sm text-muted-foreground">
            No records to chart yet.
          </div>
        ) : (
          <figure aria-label={title} className="overflow-x-auto" tabIndex={0}>
            <svg
              role="img"
              aria-label={`${title}: ${rows.map((p) => `${p.label} ${display(p.value)}`).join(", ")}`}
              viewBox={`0 0 600 ${rows.length * 42 + 30}`}
              className="w-full min-w-[500px]"
            >
              <title>{title}</title>
              {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                <line
                  key={f}
                  x1={170 + 350 * f}
                  x2={170 + 350 * f}
                  y1="4"
                  y2={rows.length * 42}
                  stroke="currentColor"
                  className="text-border"
                  strokeDasharray="3 5"
                />
              ))}
              {rows.map((p, i) => (
                <g key={`${p.label}-${i}`}>
                  <title>
                    {p.label}: {display(p.value)}
                  </title>
                  <text
                    x="0"
                    y={i * 42 + 23}
                    fill="currentColor"
                    fontSize="13"
                    className="text-muted-foreground"
                  >
                    {p.label.length > 21 ? p.label.slice(0, 19) + "…" : p.label}
                  </text>
                  <rect
                    x="170"
                    y={i * 42 + 7}
                    width="350"
                    height="24"
                    rx="5"
                    fill="currentColor"
                    className="text-muted/60"
                  />
                  <rect
                    x="170"
                    y={i * 42 + 7}
                    width={(350 * p.value) / maximum}
                    height="24"
                    rx="5"
                    className={
                      tone === "orange"
                        ? "fill-[hsl(var(--brand-orange))]"
                        : "fill-[hsl(var(--brand-navy))] dark:fill-[hsl(var(--brand-orange))]"
                    }
                  />
                  <text
                    x="530"
                    y={i * 42 + 23}
                    fill="currentColor"
                    fontSize="12"
                    className="text-foreground"
                  >
                    {display(p.value)}
                  </text>
                </g>
              ))}
              <text
                x="170"
                y={rows.length * 42 + 20}
                fill="currentColor"
                fontSize="11"
                className="text-muted-foreground"
              >
                0
              </text>
              <text
                x="520"
                y={rows.length * 42 + 20}
                textAnchor="end"
                fill="currentColor"
                fontSize="11"
                className="text-muted-foreground"
              >
                {display(maximum)}
              </text>
            </svg>
            {showDataTable && (
              <details className="mt-2 text-xs text-muted-foreground">
                <summary className="cursor-pointer">View chart data</summary>
                <table className="mt-2 w-full">
                  <caption className="sr-only">{title} values</caption>
                  <thead>
                    <tr>
                      <th className="text-left">Category</th>
                      <th className="text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((p, i) => (
                      <tr key={i}>
                        <td>{p.label}</td>
                        <td className="text-right">{display(p.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            )}
          </figure>
        )}
      </CardContent>
    </Card>
  );
}
