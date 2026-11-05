import "server-only";
import { getGradebookRows } from "@/modules/tutor/features/gradebook/services/gradebook.service";
import { getOfficePeople } from "@/shared/data/people";
import { listRecords } from "@/shared/data/records";
import type { TutorStudent } from "../types";
export async function getTutorStudents(): Promise<TutorStudent[]> {
  const [people, courses, classes] = await Promise.all([
    getOfficePeople(),
    listRecords<{ title: string; code: string }>("course"),
    listRecords<{ studentIds?: string[]; courseIds?: string[] }>("class"),
  ]);
  const [grades, progress, lessons, attendance] = await Promise.all([
    getGradebookRows(),
    listRecords<{ studentId: string; courseId: string }>("lesson_progress"),
    listRecords<{ courseId: string }>("lesson"),
    listRecords<{ studentId: string; courseId: string; mark: string }>(
      "attendance",
    ),
  ]);
  return people.flatMap((p) =>
    courses
      .filter((c) =>
        classes.some(
          (k) => k.studentIds?.includes(p.id) && k.courseIds?.includes(c.id),
        ),
      )
      .map((c) => ({
        id: `${p.id}:${c.id}`,
        name: p.name,
        email: p.email,
        courseTitle: c.title,
        courseCode: c.code,
        progressPercent: lessons.filter((l) => l.courseId === c.id).length
          ? Math.round(
              (progress.filter(
                (k) => k.courseId === c.id && k.studentId === p.id,
              ).length /
                lessons.filter((l) => l.courseId === c.id).length) *
                100,
            )
          : 0,
        averageGrade:
          grades.find((g) => g.id === `${p.id}:${c.id}`)?.overallPercent ?? 0,
        attendancePercent: attendance.filter(
          (a) => a.studentId === p.id && a.courseId === c.id,
        ).length
          ? Math.round(
              (attendance.filter(
                (a) =>
                  a.studentId === p.id &&
                  a.courseId === c.id &&
                  a.mark !== "absent",
              ).length /
                attendance.filter(
                  (a) => a.studentId === p.id && a.courseId === c.id,
                ).length) *
                100,
            )
          : 0,
      })),
  );
}
