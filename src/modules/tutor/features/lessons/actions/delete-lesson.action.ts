"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/shared/rbac";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import { deleteLesson } from "../services/lessons.service";

export async function deleteLessonAction(
  id: string,
  courseId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await authorizeAction(["tutor"]);
  await requirePermission("courses:manage_own");

  const result = await deleteLesson(id);

  if (result.ok) revalidatePath(TUTOR_ROUTES.lessons(courseId));

  return result;
}
