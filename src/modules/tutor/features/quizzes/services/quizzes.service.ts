import "server-only";
import {
  listRecords,
  getRecord,
  saveRecord,
  deleteRecord,
} from "@/shared/data/records";
import { getTutorCourseById } from "@/modules/tutor/features/courses/services/courses.service";
import type { QuizFormSchema } from "../validation/quiz-form.schema";
import type { TutorQuiz } from "../types";
export async function getTutorQuizzes() {
  return listRecords<TutorQuiz>("quiz");
}
export async function getTutorQuizById(id: string) {
  return getRecord<TutorQuiz>("quiz", id);
}
export async function createQuiz(input: QuizFormSchema) {
  const course = await getTutorCourseById(input.courseId);
  if (!course) return { ok: false as const, error: "Course not found." };
  await saveRecord<TutorQuiz>("quiz", {
    id: "",
    courseId: course.id,
    courseCode: course.code,
    title: input.title,
    durationMinutes: input.durationMinutes,
    attemptCount: 0,
    averageScorePercent: null,
    questions: input.questions.map((q) => ({ ...q, id: crypto.randomUUID() })),
  });
  return { ok: true as const };
}
export async function deleteQuiz(id: string) {
  await deleteRecord("quiz", id);
  return { ok: true as const };
}
