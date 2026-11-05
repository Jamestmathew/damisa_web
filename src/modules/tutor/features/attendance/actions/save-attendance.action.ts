"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/shared/rbac";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import { saveAttendance } from "../services/attendance.service";
import type { AttendanceMark } from "../types";

export async function saveAttendanceAction(
  courseId: string,
  marks: Record<string, AttendanceMark>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await authorizeAction(["tutor"]);
  await requirePermission("attendance:manage_own");

  const result = await saveAttendance(courseId, marks);

  if (result.ok) revalidatePath(TUTOR_ROUTES.attendance);

  return result;
}
