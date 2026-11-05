import "server-only";

import { ROLE_PERMISSIONS } from "@/shared/rbac";
import type { RolePermissionGroup } from "../types";

export async function getRolePermissionGroups(): Promise<RolePermissionGroup[]> {
  return (Object.keys(ROLE_PERMISSIONS) as Array<keyof typeof ROLE_PERMISSIONS>).map((role) => ({
    role,
    permissions: ROLE_PERMISSIONS[role],
  }));
}
