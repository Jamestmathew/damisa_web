import "server-only";

import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "@/modules/auth/constants";
import { authService } from "@/modules/auth/services";
import type { AuthUser } from "@/modules/auth/types";
import { ROLE_HOME_PATH } from "@/shared/rbac";

export async function requireAuth(
  redirectTo: string = AUTH_ROUTES.login,
): Promise<AuthUser> {
  const user = await authService.getCurrentUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

export async function requireGuest(): Promise<void> {
  const user = await authService.getCurrentUser();

  if (user) {
    redirect(ROLE_HOME_PATH[user.role]);
  }
}

export async function getOptionalSession(): Promise<AuthUser | null> {
  return authService.getCurrentUser();
}
