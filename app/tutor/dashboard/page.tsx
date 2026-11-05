import { DataBarChart } from "@/shared/charts/bar-chart";
import type { Metadata } from "next";

import { requireAuth } from "@/modules/auth/lib/route-guard";
import { getTutorDashboardData } from "@/modules/tutor/features/dashboard/services/dashboard.service";
import {
  TutorWelcomeCard,
  TutorStatsGrid,
  MyCoursesOverview,
  UpcomingClasses,
  RecentStudentActivityWidget,
  PendingAssignmentReviews,
  QuizStatistics,
  AttendanceSummaryWidget,
  TutorAnnouncementsWidget,
  TutorQuickActions,
  ProfileShortcut,
} from "@/modules/tutor/features/dashboard";

export const metadata: Metadata = { title: "Tutor Dashboard" };

export default async function TutorDashboardPage() {
  const session = await requireAuth();
  const data = await getTutorDashboardData(session.name);

  return (
    <div className="space-y-6">
      <TutorWelcomeCard firstName={data.tutorFirstName} />
      <TutorStatsGrid stats={data.stats} />

      <MyCoursesOverview courses={data.myCourses} />
      <DataBarChart
        title="Quiz performance"
        description="Average submitted-attempt scores for your quizzes"
        format="percent"
        tone="orange"
        points={data.quizStats
          .filter((q) => q.attemptCount > 0)
          .map((q) => ({ label: q.quizTitle, value: q.averageScorePercent }))}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <UpcomingClasses classes={data.upcomingClasses} />
        <PendingAssignmentReviews reviews={data.pendingReviews} />
        <RecentStudentActivityWidget activities={data.recentActivity} />
        <QuizStatistics stats={data.quizStats} />
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
