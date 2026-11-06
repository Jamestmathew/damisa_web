import { getFinanceReports } from "@/modules/super-admin/features/finance/service";
import { SuperAdminStatsGrid } from "@/modules/super-admin/features/dashboard/components/stats-grid";
import { PageHeader } from "@/shared/components";
import { TrendChart } from "@/shared/charts/trend-chart";
import { monthOf, recentMonths } from "@/shared/charts/monthly";
export default async function Page() {
  const reports = await getFinanceReports();
  const paid = reports.filter((r) => r.status === "paid");
  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance reports"
        description="Income recorded by Admins across all offices, reported here automatically"
      />
      <SuperAdminStatsGrid
        stats={[
          {
            label: "Confirmed income",
            value: `₦${paid.reduce((sum, r) => sum + r.amountNaira, 0).toLocaleString()}`,
            icon: "revenue",
          },
          {
            label: "Pending confirmation",
            value: `₦${reports
              .filter((r) => r.status === "pending")
              .reduce((sum, r) => sum + r.amountNaira, 0)
              .toLocaleString()}`,
            icon: "revenue",
          },
          { label: "Records", value: String(reports.length), icon: "revenue" },
          {
            label: "Reporting offices",
            value: String(new Set(reports.map((r) => r.officeId)).size),
            icon: "offices",
          },
        ]}
      />
      <TrendChart
        title="Monthly reported income"
        description="Confirmed amounts by date earned, last six months"
        format="naira"
        points={recentMonths().map((m) => ({
          label: m.label,
          value: paid
            .filter((r) => monthOf(r.earnedOn ?? r.recordedAt) === m.key)
            .reduce((sum, r) => sum + r.amountNaira, 0),
        }))}
      />
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {[
                "Office",
                "Company / payer",
                "Purpose",
                "Date earned",
                "Amount",
                "Status",
              ].map((h) => (
                <th key={h} className="p-3 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...reports]
              .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
              .map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-3">{r.officeName}</td>
                  <td className="p-3">{r.payerName}</td>
                  <td className="p-3">{r.purpose}</td>
                  <td className="p-3">
                    {(r.earnedOn ?? r.recordedAt).slice(0, 10)}
                  </td>
                  <td className="p-3">₦{r.amountNaira.toLocaleString()}</td>
                  <td className="p-3 capitalize">{r.status}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {!reports.length && (
          <p className="p-6 text-muted-foreground">
            No income records reported yet.
          </p>
        )}
      </div>
    </div>
  );
}
