import { GraduationCap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { ExamSummary } from "../types";

export function ExamScheduleBanner({ exam }: { exam: ExamSummary }) {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="rounded-md bg-primary/10 p-3">
          <GraduationCap className="size-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Next up: {exam.title}</p>
          <p className="text-sm text-muted-foreground">
            {exam.courseTitle} · {exam.date} at {exam.time} · {exam.venue}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
