import Link from "next/link";
import { ClipboardCheck } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/shared/components";
import { ApprovalStatusBadge } from "@/modules/admin/shared/components";
import { ADMIN_ROUTES } from "@/modules/admin/shared/constants";
import type { RecentAdmission } from "../types";

export function RecentAdmissions({ admissions }: { admissions: RecentAdmission[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Admissions</CardTitle>
        <Link href={ADMIN_ROUTES.admissions} className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {admissions.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title="No recent admissions" />
        ) : (
          <ul className="space-y-3">
            {admissions.map((admission) => (
              <li key={admission.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{admission.applicantName}</p>
                  <p className="text-xs text-muted-foreground">
                    {admission.program} · {admission.submittedAt}
                  </p>
                </div>
                <ApprovalStatusBadge status={admission.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
