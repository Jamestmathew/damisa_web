"use server";
import { RateLimitError } from "@/shared/security/rate-limit";

import {
  AUTH_ERROR_MESSAGES,
  AUTH_SUCCESS_MESSAGES,
} from "@/modules/auth/constants";
import { authService } from "@/modules/auth/services";
import type { AuthActionState } from "@/modules/auth/types";
import { resetPasswordSchema } from "@/modules/auth/validation/reset-password.schema";

export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    const parsed = resetPasswordSchema.safeParse({
      token: formData.get("token"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return {
        ok: false,
        error: "Please fix the errors below",
        fieldErrors: {
          password: fieldErrors.password?.[0],
          confirmPassword: fieldErrors.confirmPassword?.[0],
        },
      };
    }

    const result = await authService.resetPassword(parsed.data);

    if (!result.ok) {
      return result;
    }

    return {
      ok: true,
      data: undefined,
      message: AUTH_SUCCESS_MESSAGES.passwordReset,
    };
  } catch (error) {
    if (error instanceof RateLimitError)
      return { ok: false, error: error.message };
    return { ok: false, error: AUTH_ERROR_MESSAGES.genericError };
  }
}
