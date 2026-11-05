import Link from "next/link";
import { CalendarClock } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  EmptyState,
  ScheduleStatusBadge,
} from "@/modules/student/shared/components";
import { STUDENT_ROUTES } from "@/modules/student/shared/constants";
import type { CalendarPreviewItem } from "../types";

export function CalendarPreview({ items }: { items: CalendarPreviewItem[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Today&apos;s Schedule</CardTitle>
        <Link
          href={STUDENT_ROUTES.timetable}
          className="text-sm text-primary hover:underline"
        >
          Full timetable
        </Link>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState icon={CalendarClock} title="Nothing scheduled today" />
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                <ScheduleStatusBadge status={item.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
