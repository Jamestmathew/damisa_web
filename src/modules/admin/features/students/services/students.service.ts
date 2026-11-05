import "server-only";
import { listRecords } from "@/shared/data/records";
import { getOfficePeople } from "@/shared/data/people";
import type { AdminStudent, AdminStudentProfile } from "../types";
export async function getStudents(): Promise<AdminStudent[]> {
  return (await getOfficePeople())
    .filter((p) => p.role === "student")
    .map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      program: "",
      level: "",
      status: p.status,
      enrolledAt: p.created_at,
    }));
}
export async function getStudentProfile(
  id: string,
): Promise<AdminStudentProfile | null> {
  const person = (await getStudents()).find((p) => p.id === id);
  if (!person) return null;
  const [classes, courses, lessons, progress] = await Promise.all([
    listRecords<{
      studentIds?: string[];
      courseIds?: string[];
      department: string;
    }>("class"),
    listRecords<{ title: string; code: string; creditUnits: number }>("course"),
    listRecords<{ courseId: string }>("lesson"),
    listRecords<{ studentId: string; courseId: string }>("lesson_progress"),
  ]);
  const enrolled = new Set(
    classes
      .filter((c) => c.studentIds?.includes(id))
      .flatMap((c) => c.courseIds ?? []),
  );
  const enrollments = courses
    .filter((c) => enrolled.has(c.id))
    .map((c) => {
      const total = lessons.filter((l) => l.courseId === c.id).length;
      return {
        courseCode: c.code,
        courseTitle: c.title,
        progressPercent: total
          ? Math.round(
              (progress.filter((p) => p.studentId === id && p.courseId === c.id)
                .length /
                total) *
                100,
            )
          : 0,
        grade: "—",
      };
    });
  return {
    ...person,
    program: classes.find((c) => c.studentIds?.includes(id))?.department ?? "",
    phone: null,
    enrollments,
    academicSummary: {
      gpa: 0,
      creditsCompleted: courses
        .filter((c) =>
          enrollments.some(
            (e) => e.courseCode === c.code && e.progressPercent === 100,
          ),
        )
        .reduce((n, c) => n + c.creditUnits, 0),
      creditsRequired: courses
        .filter((c) => enrolled.has(c.id))
        .reduce((n, c) => n + c.creditUnits, 0),
    },
  };
}

export async function setStudentStatus(
  id: string,
  status: AdminStudent["status"],
) {
  const student = (await getStudents()).find((p) => p.id === id);
  if (!student) return { ok: false as const, error: "Student not found." };
  const { setUserStatus } = await import(
    "@/modules/admin/features/users/services/users.service"
  );
  return setUserStatus(id, status);
}
