import "server-only";
import { getContext } from "@/shared/security/context";
import { notFound } from "next/navigation";
import { listRecords, getRecord, saveRecord } from "@/shared/data/records";
import type { TutorLesson } from "@/modules/tutor/features/lessons/types";
import type { TutorCourseDetails } from "@/modules/tutor/features/courses/types";
import type { LessonDetails } from "../types";
export async function getLessonById(
  courseId: string,
  lessonId: string,
): Promise<LessonDetails> {
  const course = await getRecord<TutorCourseDetails>("course", courseId);
  const lessons = (await listRecords<TutorLesson>("lesson")).filter(
    (l) => l.courseId === courseId,
  );
  const index = lessons.findIndex((l) => l.id === lessonId);
  const lesson = lessons[index];
  if (!course || !lesson) notFound();
  const completed = (
    await listRecords<{ lessonId: string }>("lesson_progress")
  ).some((p) => p.lessonId === lessonId);
  return {
    ...lesson,
    moduleId: "lessons",
    courseTitle: course.title,
    completed,
    nextLessonId: lessons[index + 1]?.id ?? null,
    previousLessonId: lessons[index - 1]?.id ?? null,
  };
}
export async function completeLesson(courseId: string, lessonId: string) {
  const { user } = await getContext();
  await getLessonById(courseId, lessonId);
  if (
    !(await listRecords<{ lessonId: string }>("lesson_progress")).some(
      (p) => p.lessonId === lessonId,
    )
  )
    await saveRecord("lesson_progress", {
      courseId,
      lessonId,
      studentId: user.id,
      completedAt: new Date().toISOString(),
    });
}
