import { DataBarChart } from "@/shared/charts/bar-chart";
import { monthOf, recentMonths } from "@/shared/charts/monthly";
import { getOfficePeople } from "@/shared/data/people";
import { listRecords } from "@/shared/data/records";
import type { StudentFee } from "@/shared/data/balance";
import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getPayments, FinanceManager } from "@/modules/admin/features/finance";

export const metadata: Metadata = { title: "Finance" };

export default async function FinancePage() {
  const [payments, people, fees] = await Promise.all([
    getPayments(),
    getOfficePeople(),
    listRecords<StudentFee>("student_fee"),
  ]);
  const students = people
    .filter((p) => p.role === "student")
    .map((p) => ({
      id: p.id,
      name: p.name,
      matricNumber: p.matric_number,
      totalDueNaira:
        fees.find((f) => f.studentId === p.id)?.totalDueNaira ?? null,
    }));

  return (
    <div>
      <PageHeader
        title="Finance"
        description="Manually record and review each company’s earnings"
      />
      <div className="mb-6">
        <DataBarChart
          title="Monthly recorded income"
          description="Confirmed manual income over the last six months, by date earned"
          format="naira"
          tone="orange"
          points={recentMonths().map((month) => ({
            label: month.label,
            value: payments
              .filter(
                (payment) =>
                  payment.status === "paid" &&
                  monthOf(payment.earnedOn ?? payment.recordedAt) === month.key,
              )
              .reduce((sum, payment) => sum + payment.amountNaira, 0),
          }))}
        />
      </div>
      <FinanceManager students={students} payments={payments} />
    </div>
  );
}
