"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission, type AccountStatus } from "@/shared/rbac";
import { SUPER_ADMIN_ROUTES } from "@/modules/super-admin/shared/constants";
import { setAdminStatus, resetAdminPassword } from "../services/admins.service";

const STATUS_PERMISSION = {
  active: "admins:activate",
  inactive: "admins:deactivate",
  suspended: "admins:deactivate",
  archived: "admins:archive",
} as const;

export async function setAdminStatusAction(
  id: string,
  status: AccountStatus,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await authorizeAction(["super_admin"]);
  await requirePermission(STATUS_PERMISSION[status]);

  const result = await setAdminStatus(id, status);

  if (result.ok) {
    revalidatePath(SUPER_ADMIN_ROUTES.admins);
  }

  return result;
}

export async function resetAdminPasswordAction(
  id: string,
): Promise<
  { ok: true; temporaryPassword: string } | { ok: false; error: string }
> {
  await authorizeAction(["super_admin"]);
  await requirePermission("admins:edit");

  return resetAdminPassword(id);
}
