"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/shared/rbac";
import { SUPER_ADMIN_ROUTES } from "@/modules/super-admin/shared/constants";
import { adminFormSchema } from "../validation/admin-form.schema";
import { createAdmin, updateAdmin } from "../services/admins.service";
import type { AdminActionResult } from "../types";

export async function saveAdminAction(
  _prevState: AdminActionResult | null,
  formData: FormData,
): Promise<AdminActionResult> {
  await authorizeAction(["super_admin"]);
  await requirePermission("admins:create");

  try {
    const parsed = adminFormSchema.safeParse({
      id: formData.get("id") || undefined,
      name: formData.get("name"),
      email: formData.get("email"),
      staffId: formData.get("staffId"),
      officeName: formData.get("officeName") || undefined,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      return {
        ok: false,
        error: "Please fix the errors below",
        fieldErrors: {
          name: fieldErrors.name?.[0],
          email: fieldErrors.email?.[0],
          staffId: fieldErrors.staffId?.[0],
          officeName: fieldErrors.officeName?.[0],
        },
      };
    }

    const { id, ...input } = parsed.data;

    if (id) {
      const result = await updateAdmin(id, input);

      if (!result.ok) {
        return {
          ok: false,
          error: result.error,
          fieldErrors: result.fieldErrors,
        };
      }

      revalidatePath(SUPER_ADMIN_ROUTES.admins);

      return {
        ok: true,
        message: "Admin updated.",
      };
    }

    const result = await createAdmin(input);

    if (!result.ok) {
      return {
        ok: false,
        error: result.error,
        fieldErrors: result.fieldErrors,
      };
    }

    revalidatePath(SUPER_ADMIN_ROUTES.admins);

    return {
      ok: true,
      message:
        "Admin account created. Share these temporary credentials securely.",
      temporaryPassword: result.temporaryPassword,
    };
  } catch {
    return {
      ok: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
