import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getReports, ReportsList } from "@/modules/admin/features/reports";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  const reports = await getReports();

  return (
    <div>
      <PageHeader title="Reports" description="Generated academic, financial, and attendance reports" />
      <ReportsList reports={reports} />
    </div>
  );
}
