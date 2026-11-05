import { Award } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { QuizResult } from "../types";

export function QuizResultCard({ result }: { result: QuizResult }) {
  return (
    <Card className="border-success/30 bg-success/5">
      <CardContent className="space-y-3 p-6">
        <div className="flex items-center gap-2">
          <Award className="size-5 text-success" />
          <p className="text-sm font-semibold text-foreground">Quiz submitted</p>
        </div>
        <p className="text-2xl font-semibold text-foreground">{result.scorePercent}%</p>
        <p className="text-sm text-muted-foreground">
          {result.correctCount} of {result.totalCount} answered correctly
        </p>
        <Progress value={result.scorePercent} />
      </CardContent>
    </Card>
  );
}
