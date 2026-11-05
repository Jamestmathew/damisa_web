"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { ADMIN_ROUTES } from "@/modules/admin/shared/constants";
import { deleteClass } from "../services/classes.service";

export async function deleteClassAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await authorizeAction(["admin"]);
  const result = await deleteClass(id);

  if (result.ok) revalidatePath(ADMIN_ROUTES.classes);

  return result;
}
