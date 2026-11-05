import type { Metadata } from "next";

import { PageHeader } from "@/modules/student/shared/components";
import {
  getGradesOverview,
  GradeSummaryCard,
  GradeTrendChart,
  GradesTable,
} from "@/modules/student/features/grades";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Grades" };

export default async function GradesPage() {
  const overview = await getGradesOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grades"
        description="CA and exam marks; default weighting CA 30% / Exam 70%. Your performance across all courses"
      />
      <GradeSummaryCard
        gpa={overview.gpa}
        courseSummaries={overview.courseSummaries}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Grade Trend by Course</CardTitle>
        </CardHeader>
        <CardContent>
          <GradeTrendChart courseSummaries={overview.courseSummaries} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <GradesTable rows={overview.rows} />
        </CardContent>
      </Card>
    </div>
  );
}
