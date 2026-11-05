import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/shared/components";
import { PaymentStatusBadge } from "@/modules/admin/shared/components";
import { Wallet } from "lucide-react";
import type { PaymentRecord } from "@/modules/admin/features/finance/types";

export function StudentPaymentHistoryCard({ payments }: { payments: PaymentRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <EmptyState icon={Wallet} title="No payments recorded" />
        ) : (
          <ul className="space-y-3">
            {payments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">{payment.purpose}</p>
                  <p className="text-xs text-muted-foreground">{payment.reference}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">₦{payment.amountNaira.toLocaleString()}</span>
                  <PaymentStatusBadge status={payment.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
