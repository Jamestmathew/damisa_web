"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/shared/rbac";
import { ADMIN_ROUTES } from "@/modules/admin/shared/constants";
import { systemSettingsSchema } from "../validation/system-settings.schema";
import { updateSystemSettings } from "../services/settings.service";
import type { SettingsActionResult } from "../types";

export async function saveSystemSettingsAction(
  _prevState: SettingsActionResult | null,
  formData: FormData,
): Promise<SettingsActionResult> {
  await authorizeAction(["admin"]);
  await requirePermission("academic_records:manage");

  try {
    const parsed = systemSettingsSchema.safeParse({
      institutionName: formData.get("institutionName"),
      academicSession: formData.get("academicSession"),
      supportEmail: formData.get("supportEmail"),
      allowManualPaymentRecording:
        formData.get("allowManualPaymentRecording") === "on",
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return {
        ok: false,
        error: "Please fix the errors below",
        fieldErrors: {
          institutionName: fieldErrors.institutionName?.[0],
          academicSession: fieldErrors.academicSession?.[0],
          supportEmail: fieldErrors.supportEmail?.[0],
        },
      };
    }

    await updateSystemSettings(parsed.data);
    revalidatePath(ADMIN_ROUTES.settings);

    return { ok: true, message: "Settings saved." };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
