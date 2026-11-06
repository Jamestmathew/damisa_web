import { listRecords } from "@/shared/data/records";
import type { TutorEnrollment } from "@/shared/data/tutor-enrollment";
import { DonutChart } from "@/shared/charts/donut-chart";
import { TrendChart } from "@/shared/charts/trend-chart";
import { monthOf, recentMonths } from "@/shared/charts/monthly";
import type { Metadata } from "next";

import { requireAuth } from "@/modules/auth/lib/route-guard";
import { getDashboardData } from "@/modules/student/features/dashboard/services/dashboard.service";
import {
  WelcomeCard,
  StatsGrid,
  RecentCourses,
  UpcomingDeadlines,
  RecentAssignments,
  RecentGrades,
  AnnouncementsWidget,
  QuickActions,
} from "@/modules/student/features/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const tutorAssignments = (await listRecords<TutorEnrollment>("class")).filter(
    (e) => e.type === "tutor_assignment" && e.tutorId,
  );
  const session = await requireAuth();
  const submissions = await listRecords<{ submittedAt: string }>("submission");
  const completed = await listRecords<{ courseId: string }>("lesson_progress");
  const data = await getDashboardData(session.name);

  return (
    <div className="space-y-6">
      {tutorAssignments.map((e) => (
        <div key={e.id} className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Your assigned tutor</p>
          <p className="font-semibold">{e.tutorName}</p>
          <p className="text-sm text-muted-foreground">
            Published courses from your tutor appear in Courses.
          </p>
        </div>
      ))}
      <WelcomeCard firstName={data.studentFirstName} />
      <StatsGrid stats={data.stats} />
      <RecentCourses courses={data.recentCourses} />
      <div className="grid gap-6 lg:grid-cols-2">
        <TrendChart
          title="Your submissions"
          description="Assignments and projects submitted over the last six months"
          points={recentMonths().map((month) => ({
            label: month.label,
            value: submissions.filter(
              (s) => s.submittedAt && monthOf(s.submittedAt) === month.key,
            ).length,
          }))}
        />
        <DonutChart
          title="Learning activity"
          description="Completed lessons by enrolled course"
          points={data.recentCourses.map((course) => ({
            label: course.title,
            value: completed.filter((p) => p.courseId === course.id).length,
          }))}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingDeadlines deadlines={data.upcomingDeadlines} />
        <RecentAssignments assignments={data.recentAssignments} />
        <RecentGrades grades={data.recentGrades} />
        <AnnouncementsWidget announcements={data.announcements} />
        <QuickActions />
      </div>
    </div>
  );
}
