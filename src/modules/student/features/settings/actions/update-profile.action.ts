"use server";
import { authorizeAction } from "@/shared/security/action";
import { requireRole } from "@/shared/rbac";

import { revalidatePath } from "next/cache";

import { STUDENT_ROUTES } from "@/modules/student/shared/constants";
import { profilePreferencesSchema } from "../validation/preferences.schema";
import { updateProfilePreferences } from "../services/settings.service";
import type { SettingsActionResult } from "../types";

export async function updateProfileAction(
  _prevState: SettingsActionResult | null,
  formData: FormData,
): Promise<SettingsActionResult> {
  await authorizeAction(["student"]);
  await requireRole(["student"]);
  try {
    const parsed = profilePreferencesSchema.safeParse({
      displayName: formData.get("displayName"),
      bio: formData.get("bio"),
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return {
        ok: false,
        error: "Please fix the errors below",
        fieldErrors: {
          displayName: fieldErrors.displayName?.[0],
          bio: fieldErrors.bio?.[0],
        },
      };
    }

    await updateProfilePreferences(parsed.data);
    revalidatePath(STUDENT_ROUTES.settings);

    return { ok: true, message: "Profile updated." };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
