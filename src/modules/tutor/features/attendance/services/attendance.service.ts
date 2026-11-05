import "server-only";
import { createAdminClient } from "@/supabase/admin";
import { getContext } from "@/shared/security/context";
import { enforceRateLimit } from "@/shared/security/rate-limit";
import { listRecords } from "@/shared/data/records";
import { getOfficePeople } from "@/shared/data/people";
import { getTutorCourseById } from "@/modules/tutor/features/courses/services/courses.service";
import type { AttendanceSession, AttendanceMark } from "../types";
export interface SavedAttendance {
  studentId: string;
  courseId: string;
  courseTitle: string;
  courseCode: string;
  date: string;
  mark: AttendanceMark;
}
const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export async function getAttendanceSession(
  courseId: string,
): Promise<AttendanceSession | null> {
  const course = await getTutorCourseById(courseId);
  if (!course) return null;
  const classes = await listRecords<{
    courseIds?: string[];
    studentIds?: string[];
  }>("class");
  const members = new Set(
    classes
      .filter((c) => c.courseIds?.includes(courseId))
      .flatMap((c) => c.studentIds ?? []),
  );
  const people = (await getOfficePeople()).filter(
    (p) => members.has(p.id) && p.status === "active",
  );
  const records = (await listRecords<SavedAttendance>("attendance")).filter(
    (r) => r.courseId === courseId && r.date === today(),
  );
  return {
    courseId,
    courseCode: course.code,
    date: today(),
    students: people.map((p) => ({
      studentId: p.id,
      studentName: p.name,
      mark: records.find((r) => r.studentId === p.id)?.mark ?? null,
    })),
  };
}
export async function saveAttendance(
  courseId: string,
  marks: Record<string, AttendanceMark>,
) {
  const session = await getAttendanceSession(courseId);
  const course = await getTutorCourseById(courseId);
  if (!session || !course)
    return { ok: false as const, error: "Course not found." };
  if (
    Object.keys(marks).some(
      (id) => !session.students.some((s) => s.studentId === id),
    ) ||
    Object.values(marks).some((m) => !["present", "absent", "late"].includes(m))
  )
    return { ok: false as const, error: "Invalid attendance marks." };
  const records = (await listRecords<SavedAttendance>("attendance")).filter(
    (r) => r.courseId === courseId && r.date === today(),
  );
  const { user, officeId } = await getContext();
  if (user.role !== "tutor")
    return {
      ok: false as const,
      error: "Only the course tutor may record attendance.",
    };
  await enforceRateLimit("attendance-roster", user.id, 10, 60);
  const selected = session.students.filter(
    (student) => marks[student.studentId] !== undefined,
  );
  if (!selected.length)
    return {
      ok: false as const,
      error: "Select at least one attendance mark.",
    };
  const batch = selected.map((student) => {
    const existing = records.find((r) => r.studentId === student.studentId);
    return {
      id: existing?.id ?? `${courseId}:${student.studentId}:${session.date}`,
      kind: "attendance",
      office_id: officeId,
      owner_id: user.id,
      updated_by: user.id,
      revision: (existing?.__revision ?? 0) + 1,
      updated_at: new Date().toISOString(),
      payload: {
        studentId: student.studentId,
        courseId,
        courseTitle: course.title,
        courseCode: course.code,
        date: session.date,
        mark: marks[student.studentId],
      },
    };
  });
  if (batch.length) {
    const { error } = await createAdminClient()
      .from("lms_records")
      .upsert(batch, { onConflict: "id" });
    if (error) throw new Error("Unable to save the attendance roster.");
  }
  return { ok: true as const };
}
