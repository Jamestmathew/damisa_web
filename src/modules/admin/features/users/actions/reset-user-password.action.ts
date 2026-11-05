"use server";
import { authorizeAction } from "@/shared/security/action";

import { requirePermission } from "@/shared/rbac";
import { resetUserPassword } from "../services/users.service";

export async function resetUserPasswordAction(
  id: string,
): Promise<
  { ok: true; temporaryPassword: string } | { ok: false; error: string }
> {
  await authorizeAction(["admin"]);
  await requirePermission("users:reset_password");

  return resetUserPassword(id);
}
