import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getLessonsByCourse, LessonsManager } from "@/modules/tutor/features/lessons";

export const metadata: Metadata = { title: "Lessons" };

interface LessonsPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function LessonsPage({ params }: LessonsPageProps) {
  const { courseId } = await params;
  const lessons = await getLessonsByCourse(courseId);

  return (
    <div className="max-w-3xl">
      <PageHeader title="Lessons" description="Manage the lessons in this course" />
      <LessonsManager courseId={courseId} lessons={lessons} />
    </div>
  );
}
