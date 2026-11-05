import "server-only";
import { listRecords } from "@/shared/data/records";
import { getOfficePeople } from "@/shared/data/people";
import { setUserStatus } from "@/modules/admin/features/users/services/users.service";
import type { AdminTeacher } from "../types";
export async function getTeachers(): Promise<AdminTeacher[]> {
  const courses = await listRecords<{ instructorId?: string }>("course");
  return (await getOfficePeople(true, "tutor"))
    .filter((p) => p.role === "tutor")
    .map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      department: "",
      coursesAssigned: courses.filter((c) => c.instructorId === p.id).length,
      status: p.status,
      joinedAt: p.created_at,
    }));
}
export async function setTeacherStatus(
  id: string,
  status: AdminTeacher["status"],
) {
  const teacher = (await getTeachers()).find((p) => p.id === id);
  return teacher
    ? setUserStatus(id, status)
    : { ok: false as const, error: "Tutor not found." };
}
