"use server";
import { RateLimitError } from "@/shared/security/rate-limit";

import {
  AUTH_ERROR_MESSAGES,
  AUTH_SUCCESS_MESSAGES,
} from "@/modules/auth/constants";
import { authService } from "@/modules/auth/services";
import type { AuthActionState } from "@/modules/auth/types";
import { forgotPasswordSchema } from "@/modules/auth/validation/forgot-password.schema";

export async function forgotPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    const parsed = forgotPasswordSchema.safeParse({
      email: formData.get("email"),
    });

    if (!parsed.success) {
      return {
        ok: false,
        error: "Please fix the errors below",
        fieldErrors: { email: parsed.error.flatten().fieldErrors.email?.[0] },
      };
    }

    // Always return success regardless of whether the email exists,
    // to avoid leaking which addresses are registered.
    await authService.forgotPassword(parsed.data);

    return {
      ok: true,
      data: undefined,
      message: AUTH_SUCCESS_MESSAGES.passwordResetEmailSent,
    };
  } catch (error) {
    if (error instanceof RateLimitError)
      return { ok: false, error: error.message };
    return { ok: false, error: AUTH_ERROR_MESSAGES.genericError };
  }
}
