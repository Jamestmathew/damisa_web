import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/shared/components";
import { FileBarChart } from "lucide-react";
import type { CoursePerformanceReport } from "../types";

export function CoursePerformanceCards({ reports }: { reports: CoursePerformanceReport[] }) {
  if (reports.length === 0) {
    return <EmptyState icon={FileBarChart} title="No reports available yet" />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {reports.map((report) => (
        <Card key={report.courseId}>
          <CardHeader>
            <CardTitle className="text-base">{report.courseTitle}</CardTitle>
            <p className="text-xs text-muted-foreground">{report.courseCode}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Average grade</p>
                <p className="text-lg font-semibold text-foreground">{report.averageGrade}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg. attendance</p>
                <p className="text-lg font-semibold text-foreground">{report.averageAttendance}%</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Course completion</span>
                <span>{report.completionPercent}%</span>
              </div>
              <Progress value={report.completionPercent} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
