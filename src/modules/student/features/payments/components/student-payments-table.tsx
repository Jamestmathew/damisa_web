import { Wallet, Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/shared/components";
import type { StudentPayment, StudentPaymentStatus } from "../types";

const STATUS_LABEL: Record<StudentPaymentStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
};

const STATUS_VARIANT: Record<
  StudentPaymentStatus,
  "success" | "secondary" | "destructive"
> = {
  paid: "success",
  pending: "secondary",
  overdue: "destructive",
};

export function StudentPaymentsTable({
  payments,
}: {
  payments: StudentPayment[];
}) {
  if (payments.length === 0) {
    return <EmptyState icon={Wallet} title="No payment history yet" />;
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4"
        >
          <div>
            <p className="font-medium text-foreground">{payment.purpose}</p>
            <p className="text-xs text-muted-foreground">
              {payment.reference}{" "}
              {payment.paidAt
                ? `· Paid ${new Date(payment.paidAt).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" })}`
                : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-foreground">
              ₦{payment.amountNaira.toLocaleString()}
            </span>
            <Badge variant={STATUS_VARIANT[payment.status]}>
              {STATUS_LABEL[payment.status]}
            </Badge>
            {payment.status === "paid" && (
              <Button variant="ghost" size="icon" asChild>
                <a
                  aria-label="Download receipt"
                  href={`/student/payments/${payment.id}/receipt`}
                >
                  <Download className="size-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
