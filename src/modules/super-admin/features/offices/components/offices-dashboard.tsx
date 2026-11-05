import { DataBarChart } from "@/shared/charts/bar-chart";
import { SuperAdminStatsGrid } from "@/modules/super-admin/features/dashboard/components/stats-grid";
import type { Office } from "@/modules/super-admin/shared/types";

export function OfficesDashboard({
  offices,
  showSummary = true,
}: {
  offices: Office[];
  showSummary?: boolean;
}) {
  const assigned = offices.filter((office) => office.adminId).length;
  const students = offices.reduce(
    (sum, office) => sum + office.totalStudents,
    0,
  );
  const revenue = offices.reduce(
    (sum, office) => sum + office.totalRevenueNaira,
    0,
  );
  return (
    <div className="space-y-6">
      {showSummary && (
        <SuperAdminStatsGrid
          stats={[
            {
              label: "Total recorded revenue",
              value: `₦${revenue.toLocaleString("en-NG")}`,
              hint: "All-time confirmed manual records",
              icon: "revenue",
            },
            {
              label: "Total students",
              value: students.toLocaleString(),
              hint: "Current student accounts across offices",
              icon: "students",
            },
            {
              label: "Total offices",
              value: offices.length.toLocaleString(),
              hint: "Campuses and branches",
              icon: "offices",
            },
            {
              label: "Offices with an admin",
              value: `${assigned} / ${offices.length}`,
              hint: `${offices.length - assigned} awaiting assignment`,
              icon: "admins",
            },
          ]}
        />
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <DataBarChart
          title="Recorded revenue by office"
          description="All-time confirmed income · top eight offices"
          format="naira"
          tone="orange"
          points={[...offices]
            .sort((a, b) => b.totalRevenueNaira - a.totalRevenueNaira)
            .map((office) => ({
              label: office.name,
              value: office.totalRevenueNaira,
            }))}
        />
        <DataBarChart
          title="Students by office"
          showDataTable={false}
          description="Current student accounts · top eight offices"
          points={[...offices]
            .sort((a, b) => b.totalStudents - a.totalStudents)
            .map((office) => ({
              label: office.name,
              value: office.totalStudents,
            }))}
        />
      </div>
    </div>
  );
}
