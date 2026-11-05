"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, EntityToolbar, ConfirmDialog } from "@/shared/components";
import { Badge } from "@/components/ui/badge";
import type { DataTableColumn } from "@/shared/types";

import { verifyPaymentAction } from "../actions/verify-payment.action";
import type { PaymentRecord } from "../types";

import { StudentFeeDialog } from "./student-fee-dialog";
import { RecordPaymentDialog } from "./record-payment-dialog";

const METHOD_LABEL: Record<PaymentRecord["method"], string> = {
  card: "Card",
  bank_transfer: "Bank Transfer",
  cash: "Cash",
  manual: "Manual Entry",
};

export function FinanceManager({
  payments,
  students,
}: {
  payments: PaymentRecord[];
  students: {
    id: string;
    name: string;
    matricNumber?: string | null;
    totalDueNaira?: number | null;
  }[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter(
      (payment) =>
        payment.payerName.toLowerCase().includes(q) ||
        payment.reference.toLowerCase().includes(q) ||
        payment.purpose.toLowerCase().includes(q),
    );
  }, [payments, query]);

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amountNaira, 0);
  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amountNaira, 0);

  const columns: DataTableColumn<PaymentRecord>[] = [
    {
      key: "payer",
      header: "Company",
      render: (payment) => (
        <div>
          <p className="font-medium text-foreground">{payment.payerName}</p>
          <p className="text-xs text-muted-foreground">{payment.purpose}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (payment) => `₦${payment.amountNaira.toLocaleString()}`,
    },
    {
      key: "date",
      header: "Income date",
      render: (payment) => payment.earnedOn ?? payment.recordedAt.slice(0, 10),
    },
    {
      key: "method",
      header: "Method",
      render: (payment) => METHOD_LABEL[payment.method],
    },
    {
      key: "reference",
      header: "Reference",
      render: (payment) => payment.reference,
    },
    {
      key: "status",
      header: "Status",
      render: (payment) => (
        <Badge variant="outline">
          {payment.status === "paid" ? "Recorded" : payment.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (payment) => (
        <div className="flex justify-end gap-1">
          <RecordPaymentDialog
            students={students}
            record={payment}
            onSaved={() => router.refresh()}
          />
          {payment.status === "pending" ? (
            <div className="flex justify-end">
              <ConfirmDialog
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Confirm income record from ${payment.payerName}`}
                  >
                    <CheckCircle2 className="size-4 text-success" />
                  </Button>
                }
                title="Confirm income record"
                description={`Mark this ₦${payment.amountNaira.toLocaleString()} payment from ${payment.payerName} as paid.`}
                confirmLabel="Confirm"
                onConfirm={async () => {
                  await verifyPaymentAction(payment.id);
                  router.refresh();
                }}
              />
            </div>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <StudentFeeDialog students={students} />
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total recorded income</p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            ₦{totalPaid.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Pending verification</p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            ₦{totalPending.toLocaleString()}
          </p>
        </div>
      </div>

      <EntityToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search company income..."
        action={
          <RecordPaymentDialog
            students={students}
            onSaved={() => router.refresh()}
          />
        }
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(payment) => payment.id}
        emptyIcon={Wallet}
        emptyTitle="No income records found"
      />
    </div>
  );
}
