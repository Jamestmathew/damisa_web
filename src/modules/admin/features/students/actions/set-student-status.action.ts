"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { ADMIN_ROUTES } from "@/modules/admin/shared/constants";
import { setStudentStatus } from "../services/students.service";
import type { UserStatus } from "@/modules/admin/shared/types";

export async function setStudentStatusAction(
  id: string,
  status: UserStatus,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await authorizeAction(["admin"]);
  const result = await setStudentStatus(id, status);

  if (result.ok) {
    revalidatePath(ADMIN_ROUTES.students);
  }

  return result;
}
