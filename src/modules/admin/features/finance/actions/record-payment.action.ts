"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/shared/rbac";
import { ADMIN_ROUTES } from "@/modules/admin/shared/constants";
import { recordPaymentSchema } from "../validation/record-payment.schema";
import { recordManualPayment } from "../services/finance.service";
import type { FinanceActionResult } from "../types";

export async function recordPaymentAction(
  _prevState: FinanceActionResult | null,
  formData: FormData,
): Promise<FinanceActionResult> {
  await authorizeAction(["admin"]);
  await requirePermission("payments:record");

  try {
    const parsed = recordPaymentSchema.safeParse({
      id: formData.get("id") || undefined,
      studentId: formData.get("studentId") ?? "",
      earnedOn: formData.get("earnedOn"),
      payerName: formData.get("payerName"),
      payerEmail: formData.get("payerEmail"),
      purpose: formData.get("purpose"),
      amountNaira: formData.get("amountNaira"),
      reference: formData.get("reference"),
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return {
        ok: false,
        error: "Please fix the errors below",
        fieldErrors: {
          earnedOn: fieldErrors.earnedOn?.[0],
          payerName: fieldErrors.payerName?.[0],
          payerEmail: fieldErrors.payerEmail?.[0],
          purpose: fieldErrors.purpose?.[0],
          amountNaira: fieldErrors.amountNaira?.[0],
          reference: fieldErrors.reference?.[0],
        },
      };
    }

    const result = await recordManualPayment(parsed.data);
    if (!result.ok) return { ok: false, error: result.error };

    revalidatePath(ADMIN_ROUTES.finance);
    revalidatePath("/student/payments");
    revalidatePath("/super-admin/students");
    return { ok: true, message: "Company income recorded." };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
