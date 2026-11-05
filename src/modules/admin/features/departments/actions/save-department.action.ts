"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { ADMIN_ROUTES } from "@/modules/admin/shared/constants";
import { departmentFormSchema } from "../validation/department-form.schema";
import {
  createDepartment,
  updateDepartment,
} from "../services/departments.service";
import type { DepartmentActionResult } from "../types";

export async function saveDepartmentAction(
  _prevState: DepartmentActionResult | null,
  formData: FormData,
): Promise<DepartmentActionResult> {
  await authorizeAction(["admin"]);
  try {
    const parsed = departmentFormSchema.safeParse({
      id: formData.get("id") || undefined,
      name: formData.get("name"),
      code: formData.get("code"),
      headOfDepartment: formData.get("headOfDepartment"),
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return {
        ok: false,
        error: "Please fix the errors below",
        fieldErrors: {
          name: fieldErrors.name?.[0],
          code: fieldErrors.code?.[0],
          headOfDepartment: fieldErrors.headOfDepartment?.[0],
        },
      };
    }

    const { id, ...input } = parsed.data;
    const result = id
      ? await updateDepartment(id, input)
      : await createDepartment(input);

    if (!result.ok) return { ok: false, error: result.error };

    revalidatePath(ADMIN_ROUTES.departments);

    return {
      ok: true,
      message: id ? "Department updated." : "Department created.",
    };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
