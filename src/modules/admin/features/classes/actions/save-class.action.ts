"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { ADMIN_ROUTES } from "@/modules/admin/shared/constants";
import { classFormSchema } from "../validation/class-form.schema";
import { createClass, updateClass } from "../services/classes.service";
import type { ClassActionResult } from "../types";

export async function saveClassAction(
  _prevState: ClassActionResult | null,
  formData: FormData,
): Promise<ClassActionResult> {
  await authorizeAction(["admin"]);
  try {
    const parsed = classFormSchema.safeParse({
      id: formData.get("id") || undefined,
      name: formData.get("name"),
      department: formData.get("department"),
      teacher: formData.get("teacher"),
      schedule: formData.get("schedule"),
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return {
        ok: false,
        error: "Please fix the errors below",
        fieldErrors: {
          name: fieldErrors.name?.[0],
          department: fieldErrors.department?.[0],
          teacher: fieldErrors.teacher?.[0],
          schedule: fieldErrors.schedule?.[0],
        },
      };
    }

    const { id, ...input } = parsed.data;
    const result = id ? await updateClass(id, input) : await createClass(input);

    if (!result.ok) return { ok: false, error: result.error };

    revalidatePath(ADMIN_ROUTES.classes);

    return { ok: true, message: id ? "Class updated." : "Class created." };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
