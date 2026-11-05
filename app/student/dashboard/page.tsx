import { DataBarChart } from "@/shared/charts/bar-chart";
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
  CalendarPreview,
  QuickActions,
} from "@/modules/student/features/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireAuth();
  const data = await getDashboardData(session.name);

  return (
    <div className="space-y-6">
      <WelcomeCard firstName={data.studentFirstName} />
      <StatsGrid stats={data.stats} />
      <RecentCourses courses={data.recentCourses} />
      <div className="grid gap-6 lg:grid-cols-2">
        <DataBarChart
          title="Course progress"
          description="Progress in your recent courses"
          format="percent"
          points={data.recentCourses.map((c) => ({
            label: c.code,
            value: c.progressPercent,
          }))}
        />
        <DataBarChart
          title="Recent assessment scores"
          description="Scores as a percentage of the maximum mark"
          format="percent"
          tone="orange"
          points={data.recentGrades
            .filter((g) => g.maxScore > 0)
            .map((g) => ({
              label: g.assessment,
              value: (g.score / g.maxScore) * 100,
            }))}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingDeadlines deadlines={data.upcomingDeadlines} />
        <RecentAssignments assignments={data.recentAssignments} />
        <RecentGrades grades={data.recentGrades} />
        <AnnouncementsWidget announcements={data.announcements} />
        <CalendarPreview items={data.calendarPreview} />
        <QuickActions />
      </div>
    </div>
  );
}
