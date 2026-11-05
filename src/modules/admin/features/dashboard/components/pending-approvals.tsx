import { ClipboardCheck, BookOpen, Users, CalendarClock, type LucideIcon } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/shared/components";
import type { PendingApproval } from "../types";

const TYPE_ICON: Record<PendingApproval["type"], LucideIcon> = {
  admission: ClipboardCheck,
  course: BookOpen,
  user: Users,
  leave: CalendarClock,
};

export function PendingApprovals({ approvals }: { approvals: PendingApproval[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pending Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        {approvals.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title="Nothing pending" description="You're all caught up." />
        ) : (
          <ul className="space-y-3">
            {approvals.map((approval) => {
              const Icon = TYPE_ICON[approval.type];
              return (
                <li key={approval.id} className="flex items-center gap-3">
                  <div className="rounded-md bg-secondary p-2">
                    <Icon className="size-4 text-secondary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{approval.title}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{approval.requestedAt}</span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
