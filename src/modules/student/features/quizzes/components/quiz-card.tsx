import Link from "next/link";
import { HelpCircle, Clock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STUDENT_ROUTES } from "@/modules/student/shared/constants";
import type { QuizSummary } from "../types";

const STATUS_LABEL: Record<QuizSummary["status"], string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

const STATUS_VARIANT: Record<QuizSummary["status"], "outline" | "secondary" | "success"> = {
  not_started: "outline",
  in_progress: "secondary",
  completed: "success",
};

export function QuizCard({ quiz }: { quiz: QuizSummary }) {
  return (
    <Link href={STUDENT_ROUTES.quizAttempt(quiz.id)}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-secondary p-2">
              <HelpCircle className="size-4 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{quiz.title}</p>
              <p className="text-xs text-muted-foreground">{quiz.courseTitle}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {quiz.durationMinutes} min · {quiz.questionCount} questions
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={STATUS_VARIANT[quiz.status]}>{STATUS_LABEL[quiz.status]}</Badge>
            {quiz.bestScorePercent !== null ? (
              <span className="text-xs text-muted-foreground">Best: {quiz.bestScorePercent}%</span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
