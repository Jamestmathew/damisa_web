/** Convert a local wall-clock input using the office's IANA timezone. */
export function attendanceLocalTime(instant: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(instant));
  const value = (key: string) => parts.find((p) => p.type === key)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}T${value("hour")}:${value("minute")}:${value("second")}`;
}
export function attendanceInstant(local: string, timezone: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(local))
    throw new Error("Enter a valid local time.");
  const normalized = local.length === 16 ? local + ":00" : local;
  const desired = Date.parse(normalized + "Z");
  let instant = desired;
  for (let i = 0; i < 4; i++) {
    const wall = attendanceLocalTime(new Date(instant).toISOString(), timezone);
    const difference = desired - Date.parse(wall + "Z");
    if (difference === 0) return new Date(instant).toISOString();
    instant += difference;
  }
  throw new Error("This local time does not exist in the office timezone.");
}
