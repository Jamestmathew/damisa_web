import { Card, CardContent } from "@/components/ui/card";
import { ScheduleStatusBadge } from "@/modules/student/shared/components";
import type { ExamSummary } from "../types";

export function ExamCard({ exam }: { exam: ExamSummary }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div>
          <p className="text-sm font-semibold text-foreground">{exam.title}</p>
          <p className="text-xs text-muted-foreground">{exam.courseTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {exam.date} · {exam.time} · {exam.venue} · {exam.durationMinutes} min
          </p>
        </div>
        <ScheduleStatusBadge status={exam.status} />
      </CardContent>
    </Card>
  );
}
