"use server";
import { RateLimitError } from "@/shared/security/rate-limit";

import {
  AUTH_ERROR_MESSAGES,
  AUTH_SUCCESS_MESSAGES,
} from "@/modules/auth/constants";
import { authService } from "@/modules/auth/services";
import type { AuthActionState } from "@/modules/auth/types";
import { changePasswordSchema } from "@/modules/auth/validation/change-password.schema";

export async function changePasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    const user = await authService.getCurrentUser();

    if (!user) {
      return {
        ok: false,
        error: AUTH_ERROR_MESSAGES.unauthorized,
      };
    }

    const parsed = changePasswordSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmNewPassword: formData.get("confirmNewPassword"),
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      return {
        ok: false,
        error: "Please fix the errors below",
        fieldErrors: {
          currentPassword: fieldErrors.currentPassword?.[0],
          newPassword: fieldErrors.newPassword?.[0],
          confirmNewPassword: fieldErrors.confirmNewPassword?.[0],
        },
      };
    }

    const result = await authService.changePassword(user.id, parsed.data);

    if (!result.ok) {
      return result;
    }

    return {
      ok: true,
      data: undefined,
      message: AUTH_SUCCESS_MESSAGES.passwordChanged,
    };
  } catch (error) {
    if (error instanceof RateLimitError)
      return { ok: false, error: error.message };
    return {
      ok: false,
      error: AUTH_ERROR_MESSAGES.genericError,
    };
  }
}
