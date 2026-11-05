"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/shared/rbac";
import { ADMIN_ROUTES } from "@/modules/admin/shared/constants";
import { setAdmissionStatus } from "../services/admissions.service";
import type { AdmissionApplication } from "../types";

export async function setAdmissionStatusAction(
  id: string,
  status: AdmissionApplication["status"],
): Promise<{ ok: true } | { ok: false; error: string }> {
  await authorizeAction(["admin"]);
  await requirePermission("academic_records:manage");

  const result = await setAdmissionStatus(id, status);

  if (result.ok) {
    revalidatePath(ADMIN_ROUTES.admissions);
  }

  return result;
}
