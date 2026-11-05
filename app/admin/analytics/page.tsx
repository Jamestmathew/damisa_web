import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import {
  getAnalyticsOverview,
  AnalyticsMetricsGrid,
  AnalyticsBarChart,
} from "@/modules/admin/features/analytics";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const data = await getAnalyticsOverview();

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Platform-wide usage and performance trends" />
      <AnalyticsMetricsGrid metrics={data.metrics} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnalyticsBarChart title="Enrollment by Department" points={data.enrollmentByDepartment} />
        <AnalyticsBarChart title="Weekly Active Users" points={data.weeklyActiveUsers} />
      </div>
    </div>
  );
}
