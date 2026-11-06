import { TrendChart } from "@/shared/charts/trend-chart";
import { DonutChart } from "@/shared/charts/donut-chart";
import { listRecords } from "@/shared/data/records";
import { recentMonths, monthOf } from "@/shared/charts/monthly";
import type { Metadata } from "next";

import { requireAuth } from "@/modules/auth/lib/route-guard";
import { getTutorDashboardData } from "@/modules/tutor/features/dashboard/services/dashboard.service";
import {
  TutorWelcomeCard,
  TutorStatsGrid,
  MyCoursesOverview,
  RecentStudentActivityWidget,
  PendingAssignmentReviews,
  AttendanceSummaryWidget,
  TutorAnnouncementsWidget,
  TutorQuickActions,
  ProfileShortcut,
} from "@/modules/tutor/features/dashboard";

export const metadata: Metadata = { title: "Tutor Dashboard" };

export default async function TutorDashboardPage() {
  const session = await requireAuth();
  const data = await getTutorDashboardData(session.name);
  const submissions = await listRecords<{
    submittedAt: string;
    status: string;
  }>("submission");

  return (
    <div className="space-y-6">
      <TutorWelcomeCard firstName={data.tutorFirstName} />
      <TutorStatsGrid stats={data.stats} />

      <MyCoursesOverview courses={data.myCourses} />
      <div className="grid gap-6 lg:grid-cols-2">
        <TrendChart
          title="Assignment and project submissions"
          description="Submissions received over the last six months"
          points={recentMonths().map((month) => ({
            label: month.label,
            value: submissions.filter(
              (s) => s.submittedAt && monthOf(s.submittedAt) === month.key,
            ).length,
          }))}
        />
        <DonutChart
          title="Grading progress"
          description="Submitted work reviewed and awaiting grading"
          points={[
            {
              label: "Graded",
              value: submissions.filter((s) => s.status === "graded").length,
            },
            {
              label: "Awaiting grading",
              value: submissions.filter((s) => s.status !== "graded").length,
            },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <PendingAssignmentReviews reviews={data.pendingReviews} />
        <RecentStudentActivityWidget activities={data.recentActivity} />
        <AttendanceSummaryWidget ratePercent={data.attendanceRatePercent} />
        <TutorAnnouncementsWidget announcements={data.announcements} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <TutorQuickActions />
        <ProfileShortcut tutorName={session.name} />
      </div>
    </div>
  );
}
