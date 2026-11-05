"use server";
import { RateLimitError } from "@/shared/security/rate-limit";

import {
  AUTH_ERROR_MESSAGES,
  AUTH_SUCCESS_MESSAGES,
} from "@/modules/auth/constants";
import { authService } from "@/modules/auth/services";
import type { AuthActionState } from "@/modules/auth/types";
import { verifyEmailSchema } from "@/modules/auth/validation/verify-email.schema";

export async function verifyEmailAction(
  token: string,
): Promise<AuthActionState> {
  try {
    const parsed = verifyEmailSchema.safeParse({ token });

    if (!parsed.success) {
      return { ok: false, error: AUTH_ERROR_MESSAGES.tokenInvalid };
    }

    const result = await authService.verifyEmail(parsed.data);

    if (!result.ok) {
      return result;
    }

    return {
      ok: true,
      data: undefined,
      message: AUTH_SUCCESS_MESSAGES.emailVerified,
    };
  } catch (error) {
    if (error instanceof RateLimitError)
      return { ok: false, error: error.message };
    return { ok: false, error: AUTH_ERROR_MESSAGES.genericError };
  }
}
