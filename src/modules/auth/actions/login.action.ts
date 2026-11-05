"use server";
import { redirect } from "next/navigation";
import { RateLimitError } from "@/shared/security/rate-limit";

import { AUTH_ERROR_MESSAGES } from "@/modules/auth/constants";
import { authService } from "@/modules/auth/services";
import type { AuthActionState } from "@/modules/auth/types";
import { loginSchema } from "@/modules/auth/validation/login.schema";
import { ROLE_HOME_PATH } from "@/shared/rbac";

export async function loginAction(
  _prevState: AuthActionState<{ redirectTo: string }>,
  formData: FormData,
): Promise<AuthActionState<{ redirectTo: string }>> {
  let destination: string | undefined;
  try {
    const parsed = loginSchema.safeParse({
      identifier: formData.get("identifier"),
      password: formData.get("password"),
      rememberMe: formData.get("rememberMe") === "on",
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      return {
        ok: false,
        error: "Please fix the errors below",
        fieldErrors: {
          identifier: fieldErrors.identifier?.[0],
          password: fieldErrors.password?.[0],
        },
      };
    }

    const result = await authService.login(parsed.data);

    if (!result.ok) {
      return result;
    }

    destination = ROLE_HOME_PATH[result.data.user.role];
  } catch (error) {
    if (error instanceof RateLimitError)
      return { ok: false, error: error.message };
    return {
      ok: false,
      error: AUTH_ERROR_MESSAGES.genericError,
    };
  }
  redirect(destination!);
}
