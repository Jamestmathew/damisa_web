"use server";
import { RateLimitError } from "@/shared/security/rate-limit";

import {
  AUTH_ERROR_MESSAGES,
  AUTH_SUCCESS_MESSAGES,
} from "@/modules/auth/constants";
import { authService } from "@/modules/auth/services";
import type { AuthActionState } from "@/modules/auth/types";
import { registerSchema } from "@/modules/auth/validation/register.schema";

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    const parsed = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      acceptTerms: formData.get("acceptTerms") === "on",
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return {
        ok: false,
        error: "Please fix the errors below",
        fieldErrors: {
          name: fieldErrors.name?.[0],
          email: fieldErrors.email?.[0],
          password: fieldErrors.password?.[0],
          confirmPassword: fieldErrors.confirmPassword?.[0],
          acceptTerms: fieldErrors.acceptTerms?.[0],
        },
      };
    }

    const result = await authService.register(parsed.data);

    if (!result.ok) {
      return result;
    }

    return {
      ok: true,
      data: undefined,
      message: AUTH_SUCCESS_MESSAGES.registered,
    };
  } catch (error) {
    if (error instanceof RateLimitError)
      return { ok: false, error: error.message };
    return { ok: false, error: AUTH_ERROR_MESSAGES.genericError };
  }
}
