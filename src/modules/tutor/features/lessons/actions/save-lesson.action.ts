"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/shared/rbac";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import { lessonFormSchema } from "../validation/lesson-form.schema";
import { createLesson, updateLesson } from "../services/lessons.service";
import type { LessonActionResult } from "../types";

export async function saveLessonAction(
  _prevState: LessonActionResult | null,
  formData: FormData,
): Promise<LessonActionResult> {
  await authorizeAction(["tutor"]);
  await requirePermission("courses:manage_own");

  try {
    const parsed = lessonFormSchema.safeParse({
      id: formData.get("id") || undefined,
      courseId: formData.get("courseId"),
      title: formData.get("title"),
      contentType: formData.get("contentType"),
      durationMinutes: formData.get("durationMinutes"),
      body: formData.get("body"),
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return {
        ok: false,
        error: "Please fix the errors below",
        fieldErrors: {
          title: fieldErrors.title?.[0],
          contentType: fieldErrors.contentType?.[0],
          durationMinutes: fieldErrors.durationMinutes?.[0],
          body: fieldErrors.body?.[0],
        },
      };
    }

    const { id, courseId, ...input } = parsed.data;
    const result = id
      ? await updateLesson(id, input)
      : await createLesson({ courseId, ...input });

    if (!result.ok) return { ok: false, error: result.error };

    revalidatePath(TUTOR_ROUTES.lessons(courseId));
    return { ok: true, message: id ? "Lesson updated." : "Lesson created." };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
