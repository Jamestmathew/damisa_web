import { HelpCircle, CalendarCheck } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/shared/components";
import type { QuizStat } from "../types";

export function QuizStatistics({ stats }: { stats: QuizStat[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quiz Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.length === 0 ? (
          <EmptyState icon={HelpCircle} title="No quiz data yet" />
        ) : (
          stats.map((stat) => (
            <div key={stat.quizTitle} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{stat.quizTitle}</span>
                <span className="text-muted-foreground">
                  {stat.averageScorePercent}% avg · {stat.attemptCount} attempts
                </span>
              </div>
              <Progress value={stat.averageScorePercent} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function AttendanceSummaryWidget({ ratePercent }: { ratePercent: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Attendance Summary</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <div className="rounded-md bg-secondary p-3">
          <CalendarCheck className="size-5 text-secondary-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-2xl font-semibold text-foreground">{ratePercent}%</p>
          <p className="text-xs text-muted-foreground">Average attendance across your classes</p>
          <Progress value={ratePercent} className="mt-2" />
        </div>
      </CardContent>
    </Card>
  );
}
