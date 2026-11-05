"use client";

import { useRouter } from "next/navigation";
import { HelpCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ConfirmDialog } from "@/shared/components";

import { deleteQuizAction } from "../actions/delete-quiz.action";
import type { TutorQuiz } from "../types";

export function QuizzesList({ quizzes }: { quizzes: TutorQuiz[] }) {
  const router = useRouter();

  if (quizzes.length === 0) {
    return <EmptyState icon={HelpCircle} title="No quizzes yet" description="Create your first quiz above." />;
  }

  return (
    <div className="space-y-3">
      {quizzes.map((quiz) => (
        <Card key={quiz.id}>
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium text-foreground">{quiz.title}</p>
              <p className="text-xs text-muted-foreground">
                {quiz.courseCode} · {quiz.questions.length} questions · {quiz.durationMinutes} min
              </p>
              <p className="text-xs text-muted-foreground">
                {quiz.attemptCount} attempts
                {quiz.averageScorePercent !== null ? ` · Avg. score ${quiz.averageScorePercent}%` : ""}
              </p>
            </div>
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="icon" aria-label={`Delete ${quiz.title}`}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              }
              title="Delete quiz"
              description={`This will permanently remove "${quiz.title}".`}
              confirmLabel="Delete"
              onConfirm={async () => {
                await deleteQuizAction(quiz.id);
                router.refresh();
              }}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
