import "server-only";
import {
  listRecords,
  getRecord,
  saveRecord,
  deleteRecord,
} from "@/shared/data/records";
import type { TutorLesson } from "../types";
export async function getLessonsByCourse(courseId: string) {
  return (await listRecords<TutorLesson>("lesson")).filter(
    (l) => l.courseId === courseId,
  );
}
export async function getLessonById(id: string) {
  return getRecord<TutorLesson>("lesson", id);
}
export async function createLesson(input: {
  courseId: string;
  title: string;
  contentType: TutorLesson["contentType"];
  durationMinutes: number;
  body: string;
}) {
  const lesson = await saveRecord<TutorLesson>("lesson", {
    ...input,
    id: "",
    moduleTitle: "Lessons",
    published: true,
  });
  return { ok: true as const, lesson };
}
export async function updateLesson(
  id: string,
  input: {
    title: string;
    contentType: TutorLesson["contentType"];
    durationMinutes: number;
    body: string;
  },
) {
  const lesson = await getLessonById(id);
  if (!lesson) return { ok: false as const, error: "Lesson not found." };
  await saveRecord("lesson", { ...lesson, ...input }, id);
  return { ok: true as const };
}
export async function deleteLesson(id: string) {
  await deleteRecord("lesson", id);
  return { ok: true as const };
}
