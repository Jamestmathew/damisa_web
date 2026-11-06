import { getFinancialLedger } from "@/shared/finance/service";
import { FinanceLedgerReport } from "@/shared/finance/report";
import { FinanceEntryForm } from "@/shared/finance/entry-forms";
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
        title="Finance reports"
        description="Admin records are read-only here. Record direct student receipts so the responsible Admin sees them too."
      />
      <FinanceEntryForm kind="receipt" students={ledger.students} />
      <FinanceLedgerReport
        ledger={ledger}
        month={params.month ?? recentMonths().at(-1)!.key}
      />
    </div>
  );
}
