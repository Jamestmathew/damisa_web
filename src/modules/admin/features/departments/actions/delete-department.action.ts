"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { ADMIN_ROUTES } from "@/modules/admin/shared/constants";
import { deleteDepartment } from "../services/departments.service";

export async function deleteDepartmentAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await authorizeAction(["admin"]);
  const result = await deleteDepartment(id);

  if (result.ok) revalidatePath(ADMIN_ROUTES.departments);

  return result;
}
