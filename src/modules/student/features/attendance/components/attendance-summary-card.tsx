import { CalendarCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AttendanceSummary } from "../types";

export function AttendanceSummaryCard({ summary }: { summary: AttendanceSummary }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-secondary p-2">
            <CalendarCheck className="size-4 text-secondary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Attendance rate</p>
            <p className="text-2xl font-semibold text-foreground">{summary.presentPercent}%</p>
          </div>
        </div>
        <Progress value={summary.presentPercent} />
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
          <div>
            <p className="text-sm font-semibold text-foreground">{summary.presentCount}</p>
            Present
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{summary.lateCount}</p>
            Late
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{summary.absentCount}</p>
            Absent
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
