import type { CourseGradeSummary } from "../types";

export function GradeTrendChart({ courseSummaries }: { courseSummaries: CourseGradeSummary[] }) {
  return (
    <div className="flex h-40 items-end gap-4 px-2">
      {courseSummaries.map((summary) => (
        <div key={summary.courseId} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-32 w-full items-end">
            <div
              className="w-full rounded-t-md bg-primary transition-all"
              style={{ height: `${summary.currentPercent}%` }}
              aria-label={`${summary.courseCode}: ${summary.currentPercent}%`}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground">{summary.courseCode}</span>
        </div>
      ))}
    </div>
  );
}
