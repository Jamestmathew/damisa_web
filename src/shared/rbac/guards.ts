import "server-only";

import { redirect } from "next/navigation";

import { requireAuth } from "@/modules/auth/lib/route-guard";
import type { AuthUser } from "@/modules/auth/types";

import { hasPermission } from "./permissions";
import { ROLE_HOME_PATH, type Permission, type Role } from "./types";

/**
 * Requires an authenticated user AND that their role is one of `roles`.
 *
 * Use for whole route-group layouts so a signed-in user with
 * the wrong role cannot render that area.
 */
export async function requireRole(
  roles: Role[],
  redirectTo?: string,
): Promise<AuthUser> {
  const user = await requireAuth();

  if (!roles.includes(user.role)) {
    redirect(redirectTo ?? ROLE_HOME_PATH[user.role]);
  }

  return user;
}

/**
 * Requires an authenticated user AND a specific permission.
 *
 * Use for individual actions/pages that need fine-grained
 * authorization.
 */
export async function requirePermission(
  permission: Permission,
  redirectTo?: string,
): Promise<AuthUser> {
  const user = await requireAuth();

  if (!hasPermission(user.role, permission)) {
    redirect(redirectTo ?? ROLE_HOME_PATH[user.role]);
  }

  return user;
}

/**
 * Non-redirecting permission check for conditional UI,
 * such as hiding a button instead of blocking a route.
 */
export function sessionHasPermission(
  user: AuthUser,
  permission: Permission,
): boolean {
  return hasPermission(user.role, permission);
}
