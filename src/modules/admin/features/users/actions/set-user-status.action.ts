"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission, type AccountStatus } from "@/shared/rbac";
import { ADMIN_ROUTES } from "@/modules/admin/shared/constants";
import { setUserStatus } from "../services/users.service";

const STATUS_PERMISSION = {
  active: "users:activate",
  inactive: "users:deactivate",
  suspended: "users:deactivate",
  archived: "users:archive",
} as const;

export async function setUserStatusAction(
  id: string,
  status: AccountStatus,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await authorizeAction(["admin"]);
  await requirePermission(STATUS_PERMISSION[status]);

  const result = await setUserStatus(id, status);

  if (result.ok) {
    revalidatePath(ADMIN_ROUTES.users);
  }

  return result;
}
