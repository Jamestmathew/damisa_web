"use server";
import { createCourseSchema } from "../validation/course-builder.schema";
import {
  getTutorCourses,
  getTutorCourseById,
} from "@/modules/tutor/features/courses/services/courses.service";
import { saveRecord } from "@/shared/data/records";
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
    revalidatePath("/student/courses");
    revalidatePath("/admin/courses");
  }

  return result;
}

export async function updateCourseDetailsAction(
  _state: CourseBuilderActionResult | null,
  data: FormData,
): Promise<CourseBuilderActionResult> {
  await authorizeAction(["tutor"]);
  const parsed = createCourseSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success)
    return { ok: false, error: "Check the course details and try again." };
  const course = await getTutorCourseById(String(data.get("id")));
  if (!course) return { ok: false, error: "Course not found." };
  const duplicate = (await getTutorCourses()).some(
    (c) =>
      c.id !== course.id &&
      c.code.toLowerCase() === parsed.data.code.toLowerCase(),
  );
  if (duplicate)
    return { ok: false, error: "A course with this code already exists." };
  await saveRecord("course", { ...course, ...parsed.data }, course.id);
  revalidatePath("/", "layout");
  return { ok: true, message: "Course details saved." };
}
