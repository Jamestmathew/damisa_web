import type { Metadata } from "next";

import { requireAuth } from "@/modules/auth/lib/route-guard";
import { getSuperAdminDashboardData, SuperAdminStatsGrid } from "@/modules/super-admin/features/dashboard";
import { getOffices, OfficesOverviewTable } from "@/modules/super-admin/features/offices";
import { PageHeader } from "@/shared/components";

export const metadata: Metadata = { title: "Super Admin Dashboard" };

export default async function SuperAdminDashboardPage() {
  const session = await requireAuth();
  const [data, offices] = await Promise.all([
    getSuperAdminDashboardData(session.name),
    getOffices(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome back, ${data.founderFirstName}`} description="Platform-wide oversight" />
      <SuperAdminStatsGrid stats={data.stats} />
      <div>
        <h2 className="mb-3 text-base font-semibold text-foreground">Offices</h2>
        <OfficesOverviewTable offices={offices} />
      </div>
    </div>
  );
}
