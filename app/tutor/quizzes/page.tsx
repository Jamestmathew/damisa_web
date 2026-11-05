import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getTutorQuizzes, QuizBuilderForm, QuizzesList } from "@/modules/tutor/features/quizzes";
import { getTutorCourses } from "@/modules/tutor/features/courses/services/courses.service";

export const metadata: Metadata = { title: "Quizzes" };

export default async function TutorQuizzesPage() {
  const [quizzes, courses] = await Promise.all([getTutorQuizzes(), getTutorCourses()]);
  const courseOptions = courses.map((c) => ({ id: c.id, label: `${c.code} · ${c.title}` }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <PageHeader title="Quizzes" description="Existing quizzes across your courses" />
        <QuizzesList quizzes={quizzes} />
      </div>
      <div>
        <PageHeader title="New quiz" description="Build a quiz with multiple-choice questions" />
        <QuizBuilderForm courseOptions={courseOptions} />
      </div>
    </div>
  );
}
