import "server-only";
import { listRecords } from "@/shared/data/records";
import type { AdminClass } from "@/modules/admin/features/classes/types";
import type { AnalyticsOverview } from "../types";
export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const [classes, attempts, progress] = await Promise.all([
    listRecords<AdminClass>("class"),
    listRecords<{ scorePercent: number }>("quiz_attempt"),
    listRecords("lesson_progress"),
  ]);
  const departments = new Map<string, Set<string>>();
  for (const c of classes) {
    const ids = departments.get(c.department) ?? new Set<string>();
    c.studentIds?.forEach((id) => ids.add(id));
    departments.set(c.department, ids);
  }
  return {
    metrics: [
      {
        label: "Completed lessons",
        value: String(progress.length),
        hint: "Recorded completions",
      },
      {
        label: "Average quiz score",
        value: attempts.length
          ? `${Math.round(attempts.reduce((n, a) => n + a.scorePercent, 0) / attempts.length)}%`
          : "—",
        hint: "Submitted attempts",
      },
      {
        label: "Classes",
        value: String(classes.length),
        hint: "In your office",
      },
    ],
    enrollmentByDepartment: [...departments].map(([label, ids]) => ({
      label,
      value: ids.size,
    })),
    weeklyActiveUsers: [],
  };
}
