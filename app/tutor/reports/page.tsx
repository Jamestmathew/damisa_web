import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getTutorReports, CoursePerformanceCards } from "@/modules/tutor/features/reports";

export const metadata: Metadata = { title: "Reports" };

export default async function TutorReportsPage() {
  const reports = await getTutorReports();

  return (
    <div>
      <PageHeader title="Reports" description="Performance summaries for your courses" />
      <CoursePerformanceCards reports={reports} />
    </div>
  );
}
