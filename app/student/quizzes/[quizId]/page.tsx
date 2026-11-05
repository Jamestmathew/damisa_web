import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/modules/student/shared/components";
import { getQuizById, QuizTakingForm } from "@/modules/student/features/quizzes";

export const metadata: Metadata = { title: "Quiz" };

interface QuizAttemptPageProps {
  params: Promise<{ quizId: string }>;
}

export default async function QuizAttemptPage({ params }: QuizAttemptPageProps) {
  const { quizId } = await params;
  const quiz = await getQuizById(quizId);

  if (!quiz) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={quiz.title}
        description={`${quiz.courseTitle} · ${quiz.durationMinutes} min · ${quiz.questionCount} questions`}
      />
      <QuizTakingForm quiz={quiz} />
    </div>
  );
}
