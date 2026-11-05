import type { Metadata } from "next";

import { PageHeader } from "@/modules/student/shared/components";
import {
  getProgressOverview,
  ProgressOverviewCard,
  CourseProgressList,
  SkillProgressList,
} from "@/modules/student/features/progress";

export const metadata: Metadata = { title: "Progress" };

export default async function ProgressPage() {
  const overview = await getProgressOverview();

  return (
    <div className="space-y-6">
      <PageHeader title="Progress" description="Your overall learning progress" />

      <div className="max-w-sm">
        <ProgressOverviewCard overallPercent={overview.overallPercent} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CourseProgressList courses={overview.courses} />
        <SkillProgressList skills={overview.skills} />
      </div>
    </div>
  );
}
