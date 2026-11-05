import { CalendarClock } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/shared/components";
import { ScheduleStatusBadge } from "@/modules/tutor/shared/components";
import type { UpcomingClass } from "../types";

export function UpcomingClasses({ classes }: { classes: UpcomingClass[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Today&apos;s Classes</CardTitle>
      </CardHeader>
      <CardContent>
        {classes.length === 0 ? (
          <EmptyState icon={CalendarClock} title="Nothing scheduled today" />
        ) : (
          <ul className="space-y-3">
            {classes.map((cls) => (
              <li key={cls.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{cls.courseTitle}</p>
                  <p className="text-xs text-muted-foreground">{cls.time}</p>
                </div>
                <ScheduleStatusBadge status={cls.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
