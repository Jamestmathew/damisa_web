import { getFinancialLedger } from "@/shared/finance/service";
import { FinanceLedgerReport } from "@/shared/finance/report";
import { AdminFinanceControls } from "@/shared/finance/admin-controls";
import { recentMonths } from "@/shared/charts/monthly";
import { PageHeader } from "@/shared/components";
export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const [ledger, params] = await Promise.all([
    getFinancialLedger(),
    searchParams,
  ]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance"
        description="Shared student receipts, balances and monthly expenses. Super Admin receipts appear here automatically."
      />
      <AdminFinanceControls students={ledger.students} />
      <FinanceLedgerReport
        ledger={ledger}
        month={params.month ?? recentMonths().at(-1)!.key}
      />
    </div>
  );
}
