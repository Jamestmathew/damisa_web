import "server-only";
import { listRecords } from "@/shared/data/records";
import { getGradebookRows } from "@/modules/tutor/features/gradebook/services/gradebook.service";
import type { CoursePerformanceReport } from "../types";
export async function getTutorReports(): Promise<CoursePerformanceReport[]> {
  const [courses, grades, attendance, lessons, progress, classes] =
    await Promise.all([
      listRecords<{ title: string; code: string }>("course"),
      getGradebookRows(),
      listRecords<{ courseId: string; mark: string }>("attendance"),
      listRecords<{ courseId: string }>("lesson"),
      listRecords<{ courseId: string }>("lesson_progress"),
      listRecords<{ courseIds?: string[]; studentIds?: string[] }>("class"),
    ]);
  return courses.map((c) => {
    const g = grades.filter((g) => g.courseCode === c.code),
      a = attendance.filter((a) => a.courseId === c.id);
    const totalStudents = new Set(
      classes
        .filter((k) => k.courseIds?.includes(c.id))
        .flatMap((k) => k.studentIds ?? []),
    ).size;
    const total =
      lessons.filter((l) => l.courseId === c.id).length * totalStudents;
    return {
      courseId: c.id,
      courseCode: c.code,
      courseTitle: c.title,
      averageGrade: g.length
        ? Math.round(g.reduce((n, g) => n + g.overallPercent, 0) / g.length)
        : 0,
      averageAttendance: a.length
        ? Math.round(
            (a.filter((a) => a.mark !== "absent").length / a.length) * 100,
          )
        : 0,
      completionPercent: total
        ? Math.min(
            100,
            Math.round(
              (progress.filter((p) => p.courseId === c.id).length / total) *
                100,
            ),
          )
        : 0,
    };
  });
}
