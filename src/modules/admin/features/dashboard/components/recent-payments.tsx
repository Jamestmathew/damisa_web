import Link from "next/link";
import { Wallet } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/shared/components";
import { Badge } from "@/components/ui/badge";
import { ADMIN_ROUTES } from "@/modules/admin/shared/constants";
import type { RecentPayment } from "../types";

export function RecentPayments({ payments }: { payments: RecentPayment[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Company Income</CardTitle>
        <Link
          href={ADMIN_ROUTES.finance}
          className="text-sm text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <EmptyState icon={Wallet} title="No income recorded yet" />
        ) : (
          <ul className="space-y-3">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {payment.payerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payment.purpose}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-semibold text-foreground">
                    ₦{payment.amountNaira.toLocaleString()}
                  </span>
                  <Badge variant="outline">Recorded</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
