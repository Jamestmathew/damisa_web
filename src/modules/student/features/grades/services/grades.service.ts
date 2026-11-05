import "server-only";
import { listRecords } from "@/shared/data/records";
import { getCourses } from "@/modules/student/features/courses/services/courses.service";
import { loadAssessmentMarks } from "@/shared/academic/marks";
import {
  calculateResult,
  DEFAULT_ASSESSMENT_POLICY,
  letterFor,
} from "@/shared/academic/grading";
import type { GradesOverview, CourseGradeRow } from "../types";
export { letterFor };
export async function getGradesOverview(): Promise<GradesOverview> {
  const [courses, marks, overrides] = await Promise.all([
    getCourses(),
    loadAssessmentMarks(),
    listRecords<{ courseId: string; overallPercent: number }>("grade_override"),
  ]);
  const rows: CourseGradeRow[] = [];
  const courseSummaries = courses.flatMap((course) => {
    const own = marks.filter((m) => m.courseId === course.id);
    const policy = course.assessmentPolicy ?? DEFAULT_ASSESSMENT_POLICY;
    const result = calculateResult(own, policy);
    const override = overrides.find((o) => o.courseId === course.id);
    if (result.overallPercent === null && !override) return [];
    for (const mark of own) {
      const included =
        mark.category === "exam" || result.caMarkIds.includes(mark.id);
      const categoryMarks = own.filter((m) =>
        mark.category === "exam"
          ? m.category === "exam"
          : result.caMarkIds.includes(m.id),
      );
      const max = categoryMarks.reduce((n, m) => n + m.maxScore, 0);
      rows.push({
        id: mark.id,
        courseTitle: course.title,
        courseCode: course.code,
        assessment: `${mark.source === "manual" ? (mark.category === "ca" ? "CA: " : "Exam: ") : ""}${mark.title}`,
        score: mark.score,
        maxScore: mark.maxScore,
        weightPercent:
          included && max
            ? Math.round(
                (((mark.category === "ca"
                  ? policy.caWeight
                  : policy.examWeight) *
                  mark.maxScore) /
                  max) *
                  100,
              ) / 100
            : 0,
      });
    }
    const currentPercent =
      override?.overallPercent ?? result.overallPercent ?? 0;
    return [
      {
        provisional: override ? false : result.provisional,
        caWeight: policy.caWeight,
        examWeight: policy.examWeight,
        courseId: course.id,
        courseTitle: course.title,
        courseCode: course.code,
        currentPercent,
        letterGrade: letterFor(currentPercent),
      },
    ];
  });
  const points: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
  const credits = courseSummaries.reduce(
    (n, c) => n + (courses.find((k) => k.id === c.courseId)?.creditUnits ?? 0),
    0,
  );
  const gpa = credits
    ? courseSummaries.reduce(
        (n, c) =>
          n +
          (points[c.letterGrade] ?? 0) *
            (courses.find((k) => k.id === c.courseId)?.creditUnits ?? 0),
        0,
      ) / credits
    : 0;
  return { gpa: Math.round(gpa * 100) / 100, courseSummaries, rows };
}
