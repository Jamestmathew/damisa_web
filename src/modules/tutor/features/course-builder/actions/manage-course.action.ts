"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/shared/rbac";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import {
  addCourseModule,
  setCoursePublishStatus,
} from "@/modules/tutor/features/courses/services/courses.service";
import { addModuleSchema } from "../validation/course-builder.schema";
import type { CourseBuilderActionResult } from "./create-course.action";

export async function addModuleAction(
  _prevState: CourseBuilderActionResult | null,
  formData: FormData,
): Promise<CourseBuilderActionResult> {
  await authorizeAction(["tutor"]);
  await requirePermission("courses:manage_own");

  const parsed = addModuleSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below",
      fieldErrors: { title: parsed.error.flatten().fieldErrors.title?.[0] },
    };
  }

  const result = await addCourseModule(parsed.data.courseId, parsed.data.title);

  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath(TUTOR_ROUTES.courseBuilder(parsed.data.courseId));
  return { ok: true, message: "Module added." };
}

export async function toggleCoursePublishAction(
  courseId: string,
  status: "published" | "draft",
): Promise<{ ok: true } | { ok: false; error: string }> {
  await authorizeAction(["tutor"]);
  await requirePermission("courses:manage_own");

  const result = await setCoursePublishStatus(courseId, status);

  if (result.ok) {
    revalidatePath(TUTOR_ROUTES.courseBuilder(courseId));
    revalidatePath(TUTOR_ROUTES.courses);
  }

  return result;
}
