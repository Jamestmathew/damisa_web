import { BarChart3 } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/modules/student/shared/components";
import type { RecentGradePreview } from "../types";

export function RecentGrades({ grades }: { grades: RecentGradePreview[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Grades</CardTitle>
      </CardHeader>
      <CardContent>
        {grades.length === 0 ? (
          <EmptyState icon={BarChart3} title="No grades yet" />
        ) : (
          <ul className="space-y-3">
            {grades.map((grade) => (
              <li key={grade.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{grade.assessment}</p>
                  <p className="text-xs text-muted-foreground">{grade.courseTitle}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-foreground">
                  {grade.score}/{grade.maxScore}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
