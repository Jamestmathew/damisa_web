"use server";
import { authorizeAction } from "@/shared/security/action";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/shared/rbac";
import { getRecord, listRecords, saveRecord } from "@/shared/data/records";
import { getUsers } from "@/modules/admin/features/users/services/users.service";
import type { AdminClass } from "../types";

export async function enrollClassAction(formData: FormData) {
  await authorizeAction(["admin"]);
  await requireRole(["admin"]);
  const id = String(formData.get("classId") ?? "");
  const classItem = await getRecord<AdminClass>("class", id);
  if (!classItem) throw new Error("Class not found.");
  const studentIds = [...new Set(formData.getAll("studentIds").map(String))];
  const courseIds = [...new Set(formData.getAll("courseIds").map(String))];
  const users = await getUsers();
  const validStudents = new Set(
    users
      .filter((u) => u.role === "student" && u.status === "active")
      .map((u) => u.id),
  );
  const validCourses = new Set((await listRecords("course")).map((c) => c.id));
  if (
    studentIds.some((id) => !validStudents.has(id)) ||
    courseIds.some((id) => !validCourses.has(id))
  )
    throw new Error("Select students and courses from your office.");
  await saveRecord(
    "class",
    { ...classItem, studentIds, courseIds, studentCount: studentIds.length },
    id,
  );
  revalidatePath("/admin/classes");
  revalidatePath("/student", "layout");
}
