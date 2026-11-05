import { Card, CardContent } from "@/components/ui/card";
import type { CourseGradeSummary } from "../types";

export function GradeSummaryCard({
  gpa,
  courseSummaries,
}: {
  gpa: number;
  courseSummaries: CourseGradeSummary[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-5">
          <p className="text-sm text-primary-foreground/80">
            {!courseSummaries.length ||
            courseSummaries.some((s) => s.provisional)
              ? "Provisional GPA"
              : "GPA"}
          </p>
          <p className="mt-1 text-3xl font-semibold">{gpa.toFixed(2)}</p>
        </CardContent>
      </Card>

      {courseSummaries.map((summary) => (
        <Card key={summary.courseId}>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">
              {summary.courseCode}
            </p>
            <p className="mt-1 truncate text-sm font-medium text-foreground">
              {summary.courseTitle}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              CA {summary.caWeight ?? 30}% / Exam {summary.examWeight ?? 70}% ·{" "}
              {summary.provisional ? "Provisional" : "Final"}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-semibold text-foreground">
                {summary.letterGrade}
              </span>
              <span className="text-xs text-muted-foreground">
                {summary.currentPercent}%
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
