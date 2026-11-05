import { HelpCircle } from "lucide-react";

import { EmptyState } from "@/modules/student/shared/components";
import type { QuizSummary } from "../types";

import { QuizCard } from "./quiz-card";

export function QuizList({ quizzes }: { quizzes: QuizSummary[] }) {
  if (quizzes.length === 0) {
    return <EmptyState icon={HelpCircle} title="No quizzes" description="No quizzes have been scheduled yet." />;
  }

  return (
    <div className="space-y-3">
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} />
      ))}
    </div>
  );
}
