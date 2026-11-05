import type { Metadata } from "next";

import { PageHeader } from "@/modules/student/shared/components";
import { getQuizzes, QuizList } from "@/modules/student/features/quizzes";

export const metadata: Metadata = { title: "Quizzes" };

export default async function QuizzesPage() {
  const quizzes = await getQuizzes();

  return (
    <div>
      <PageHeader title="Quizzes" description="Short assessments for each course module" />
      <QuizList quizzes={quizzes} />
    </div>
  );
}
