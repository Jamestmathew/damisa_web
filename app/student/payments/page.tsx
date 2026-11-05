import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import {
  getStudentPayments,
  getStudentBalance,
  StudentPaymentsTable,
} from "@/modules/student/features/payments";

export const metadata: Metadata = { title: "Payments" };

export default async function StudentPaymentsPage() {
  const [payments, balance] = await Promise.all([
    getStudentPayments(),
    getStudentBalance(),
  ]);
  const amount = (value: number | null) =>
    value === null ? "Not set" : `₦${value.toLocaleString()}`;

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Your payment history and status"
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total fees", value: balance.totalDueNaira },
          { label: "Amount paid", value: balance.paidNaira },
          { label: "Remaining balance", value: balance.remainingNaira },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-xl font-semibold">{amount(item.value)}</p>
          </div>
        ))}
      </div>
      {balance.totalDueNaira === null && (
        <p className="mb-4 text-sm text-muted-foreground">
          Your admin has not set your total fees yet.
        </p>
      )}
      {balance.creditNaira > 0 && (
        <p className="mb-4 text-sm">
          Account credit: {amount(balance.creditNaira)}
        </p>
      )}
      <StudentPaymentsTable payments={payments} />
    </div>
  );
}
