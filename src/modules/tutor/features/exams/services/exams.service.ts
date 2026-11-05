import { listRecords, commitCollection } from "@/shared/data/collections";
import "server-only";

import { getTutorCourseById } from "@/modules/tutor/features/courses/services/courses.service";
import type { TutorExam } from "../types";

function generateId() {
  return crypto.randomUUID();
}

export async function getTutorExams(): Promise<TutorExam[]> {
  const exams: TutorExam[] = await listRecords<TutorExam>("exam");

  return [...exams];
}

export async function scheduleExam(input: {
  courseId: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  durationMinutes: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const exams: TutorExam[] = await listRecords<TutorExam>("exam");
  const before = structuredClone(exams);
  const result = await (async (): Promise<
    { ok: true } | { ok: false; error: string }
  > => {
    const course = await getTutorCourseById(input.courseId);

    exams.push({
      id: generateId(),
      courseId: input.courseId,
      courseCode: course?.code ?? input.courseId,
      title: input.title,
      date: input.date,
      time: input.time,
      venue: input.venue,
      durationMinutes: input.durationMinutes,
    });

    return { ok: true };
  })();
  if (result.ok) await commitCollection("exam", before, exams);
  return result;
}

export async function deleteExam(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const exams: TutorExam[] = await listRecords<TutorExam>("exam");
  const before = structuredClone(exams);
  const result = await (async (): Promise<
    { ok: true } | { ok: false; error: string }
  > => {
    const index = exams.findIndex((e) => e.id === id);
    if (index === -1) return { ok: false, error: "Exam not found." };

    exams.splice(index, 1);
    return { ok: true };
  })();
  if (result.ok) await commitCollection("exam", before, exams);
  return result;
}
