export function recentMonths(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value) - 1;
  return Array.from({ length: 6 }, (_, i) => {
    const date = new Date(Date.UTC(year, month - 5 + i, 1));
    return {
      key: date.toISOString().slice(0, 7),
      label: new Intl.DateTimeFormat("en-GB", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      }).format(date),
    };
  });
}
export function monthOf(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.slice(0, 7);
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  return `${parts.find((p) => p.type === "year")?.value}-${parts.find((p) => p.type === "month")?.value}`;
}
