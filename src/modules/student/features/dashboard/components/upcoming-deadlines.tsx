import { ClipboardList, HelpCircle, GraduationCap, type LucideIcon } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/modules/student/shared/components";
import type { UpcomingDeadline } from "../types";

const TYPE_ICON: Record<UpcomingDeadline["type"], LucideIcon> = {
  assignment: ClipboardList,
  quiz: HelpCircle,
  exam: GraduationCap,
};

export function UpcomingDeadlines({ deadlines }: { deadlines: UpcomingDeadline[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent>
        {deadlines.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No upcoming deadlines" description="You're all caught up." />
        ) : (
          <ul className="space-y-3">
            {deadlines.map((deadline) => {
              const Icon = TYPE_ICON[deadline.type];
              return (
                <li key={deadline.id} className="flex items-center gap-3">
                  <div className="rounded-md bg-secondary p-2">
                    <Icon className="size-4 text-secondary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{deadline.title}</p>
                    <p className="text-xs text-muted-foreground">{deadline.courseTitle}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    {deadline.dueAt}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
