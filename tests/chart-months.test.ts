import test from "node:test";
import assert from "node:assert/strict";
import { recentMonths, monthOf } from "../src/shared/charts/monthly.ts";
test("dashboard periods cover six ordered months across year boundaries", () => {
  const periods = recentMonths(new Date("2027-01-05T12:00:00Z"));
  assert.deepEqual(
    periods.map((p) => p.key),
    ["2026-08", "2026-09", "2026-10", "2026-11", "2026-12", "2027-01"],
  );
  assert.equal(new Set(periods.map((p) => p.label)).size, 6);
});
test("financial timestamps use Lagos months while earned dates retain their calendar month", () => {
  assert.equal(monthOf("2026-12-31T23:30:00Z"), "2027-01");
  assert.equal(monthOf("2026-12-31"), "2026-12");
  assert.equal(monthOf("not-a-date"), null);
});
