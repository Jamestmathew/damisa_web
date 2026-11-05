"use server";
import { authorizeAction } from "@/shared/security/action";

import { redirect } from "next/navigation";

import { requirePermission } from "@/shared/rbac";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import { createCourse } from "@/modules/tutor/features/courses/services/courses.service";
import { createCourseSchema } from "../validation/course-builder.schema";

export type CourseBuilderActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> };

export async function createCourseAction(
  _prevState: CourseBuilderActionResult | null,
  formData: FormData,
): Promise<CourseBuilderActionResult> {
  await authorizeAction(["tutor"]);
  await requirePermission("courses:manage_own");

  const parsed = createCourseSchema.safeParse({
    title: formData.get("title"),
    code: formData.get("code"),
    description: formData.get("description"),
    creditUnits: formData.get("creditUnits"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      error: "Please fix the errors below",
      fieldErrors: {
        title: fieldErrors.title?.[0],
        code: fieldErrors.code?.[0],
        description: fieldErrors.description?.[0],
        creditUnits: fieldErrors.creditUnits?.[0],
      },
    };
  }

  const result = await createCourse(parsed.data);

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  redirect(TUTOR_ROUTES.courseBuilder(result.course.id));
}
