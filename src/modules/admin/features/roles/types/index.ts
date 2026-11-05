import type { Permission, Role } from "@/shared/rbac";

export interface RolePermissionGroup {
  role: Role;
  permissions: Permission[];
}
