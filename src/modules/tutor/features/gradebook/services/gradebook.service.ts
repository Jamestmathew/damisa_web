import "server-only";
import { listRecords, saveRecord } from "@/shared/data/records";
import { getOfficePeople } from "@/shared/data/people";
import { loadAssessmentMarks } from "@/shared/academic/marks";
import {
  calculateResult,
  letterFor,
  DEFAULT_ASSESSMENT_POLICY,
} from "@/shared/academic/grading";
import type { TutorCourseDetails } from "@/modules/tutor/features/courses/types";
import type { GradebookRow } from "../types";
interface Override {
  studentId: string;
  courseId: string;
  overallPercent: number;
}
export async function getGradebookRows(): Promise<GradebookRow[]> {
  const [people, classes, courses, marks, overrides] = await Promise.all([
    getOfficePeople(),
    listRecords<{ studentIds?: string[]; courseIds?: string[] }>("class"),
    listRecords<TutorCourseDetails>("course"),
    loadAssessmentMarks(),
    listRecords<Override>("grade_override"),
  ]);
  return courses.flatMap((c) =>
    people
      .filter((p) =>
        classes.some(
          (k) => k.courseIds?.includes(c.id) && k.studentIds?.includes(p.id),
        ),
      )
      .map((p) => {
        const own = marks.filter(
          (m) => m.courseId === c.id && m.studentId === p.id,
        );
        const result = calculateResult(
          own,
          c.assessmentPolicy ?? DEFAULT_ASSESSMENT_POLICY,
        );
        const avg = (source: string) => {
          const a = own.filter((m) => m.source === source);
          return a.length
            ? Math.round(
                a.reduce((n, m) => n + (m.score / m.maxScore) * 100, 0) /
                  a.length,
              )
            : null;
        };
        const override = overrides.find(
          (o) => o.courseId === c.id && o.studentId === p.id,
        );
        const overallPercent =
          override?.overallPercent ?? result.overallPercent ?? 0;
        return {
          id: `${p.id}:${c.id}`,
          studentName: p.name,
          courseCode: c.code,
          assignmentAvg: avg("assignment"),
          quizAvg: avg("quiz"),
          caPercent: result.caPercent,
          examScore: result.examPercent,
          overallPercent,
          letterGrade: letterFor(overallPercent),
          provisional: result.provisional,
          hasMarks: own.length > 0,
          hasOverride: Boolean(override),
        };
      }),
  );
}
export async function overrideOverallGrade(id: string, overallPercent: number) {
  if (
    !Number.isFinite(overallPercent) ||
    overallPercent < 0 ||
    overallPercent > 100
  )
    return { ok: false as const, error: "Grade must be between 0 and 100." };
  if (!(await getGradebookRows()).some((r) => r.id === id))
    return { ok: false as const, error: "Record not found." };
  const [studentId, courseId] = id.split(":");
  const existing = (await listRecords<Override>("grade_override")).find(
    (o) => o.studentId === studentId && o.courseId === courseId,
  );
  await saveRecord(
    "grade_override",
    { ...existing, studentId, courseId, overallPercent },
    existing?.id,
  );
  return { ok: true as const };
}
