"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/shared/rbac";
import { ADMIN_ROUTES } from "@/modules/admin/shared/constants";
import { verifyPayment } from "../services/finance.service";

export async function verifyPaymentAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await authorizeAction(["admin"]);
  await requirePermission("payments:verify");

  const result = await verifyPayment(id);

  if (result.ok) {
    revalidatePath(ADMIN_ROUTES.finance);
  }

  return result;
}
