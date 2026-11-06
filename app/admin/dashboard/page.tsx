import type { Metadata } from "next";

import { requireAuth } from "@/modules/auth/lib/route-guard";
import { getAdminDashboardData } from "@/modules/admin/features/dashboard/services/dashboard.service";
import {
  AdminStatsGrid,
  EnrollmentOverview,
  RevenueOverview,
  ActiveUsersCard,
  RecentPayments,
  AdminAnnouncementsWidget,
  AdminQuickActions,
} from "@/modules/admin/features/dashboard";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const session = await requireAuth();
  const data = await getAdminDashboardData(session.name);

  return (
    <div className="space-y-6">
      <AdminStatsGrid stats={data.stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EnrollmentOverview points={data.enrollmentTrend} />
        <RevenueOverview points={data.revenueTrend} />
      </div>

      <ActiveUsersCard
        count={data.activeUsersCount}
        delta={data.activeUsersDelta}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <RecentPayments payments={data.recentPayments} />
        <AdminAnnouncementsWidget announcements={data.announcements} />
        <AdminQuickActions />
      </div>
    </div>
  );
}
