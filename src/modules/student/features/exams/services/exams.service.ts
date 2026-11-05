import "server-only";
import { listRecords } from "@/shared/data/records";
import type { TutorExam } from "@/modules/tutor/features/exams/types";
import type { ExamSummary } from "../types";
export async function getExams(): Promise<ExamSummary[]> {
  return (await listRecords<TutorExam>("exam")).map((e) => ({
    ...e,
    courseTitle: e.courseCode,
    status: Date.parse(e.date) < Date.now() ? "completed" : "upcoming",
  }));
}
