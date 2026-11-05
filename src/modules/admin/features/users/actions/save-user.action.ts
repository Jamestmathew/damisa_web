"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/shared/rbac";
import { ADMIN_ROUTES } from "@/modules/admin/shared/constants";
import { userFormSchema } from "../validation/user-form.schema";
import { createUser, updateUser } from "../services/users.service";
import type { UserActionResult } from "../types";

export async function saveUserAction(
  _prevState: UserActionResult | null,
  formData: FormData,
): Promise<UserActionResult> {
  await authorizeAction(["admin"]);
  // Enforced here, not just hidden in the UI: only an Admin with
  // users:create/users:edit may reach this far, regardless of what the
  // client sent. Deliberately outside the try/catch below — `redirect()`
  // throws a Next.js control-flow signal that must propagate, not be
  // caught and turned into a generic error.
  await requirePermission("users:create");

  try {
    const parsed = userFormSchema.safeParse({
      id: formData.get("id") || undefined,
      name: formData.get("name"),
      email: formData.get("email") || undefined,
      role: formData.get("role"),
      matricNumber: formData.get("matricNumber") || undefined,
      staffId: formData.get("staffId") || undefined,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return {
        ok: false,
        error: "Please fix the errors below",
        fieldErrors: {
          name: fieldErrors.name?.[0],
          email: fieldErrors.email?.[0],
          role: fieldErrors.role?.[0],
          matricNumber: fieldErrors.matricNumber?.[0],
          staffId: fieldErrors.staffId?.[0],
        },
      };
    }

    const { id, ...input } = parsed.data;

    if (id) {
      const result = await updateUser(id, input);
      if (!result.ok)
        return {
          ok: false,
          error: result.error,
          fieldErrors: result.fieldErrors,
        };

      revalidatePath(ADMIN_ROUTES.users);
      return { ok: true, message: "User updated." };
    }

    const result = await createUser({ ...input, email: input.email ?? "" });
    if (!result.ok)
      return {
        ok: false,
        error: result.error,
        fieldErrors: result.fieldErrors,
      };

    revalidatePath(ADMIN_ROUTES.users);
    return {
      ok: true,
      message: "User created. Share these temporary credentials securely.",
      temporaryPassword: result.temporaryPassword,
    };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
