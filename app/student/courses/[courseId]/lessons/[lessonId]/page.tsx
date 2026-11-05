import type { Metadata } from "next";

import { getLessonById, LessonPlayer, LessonNavigation } from "@/modules/student/features/lessons";

export const metadata: Metadata = { title: "Lesson" };

interface LessonPageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseId, lessonId } = await params;
  const lesson = await getLessonById(courseId, lessonId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <LessonPlayer lesson={lesson} />
      <LessonNavigation lesson={lesson} />
    </div>
  );
}
