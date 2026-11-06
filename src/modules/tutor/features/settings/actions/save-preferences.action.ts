"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { preferencesFormSchema } from "../validation/preferences-form.schema";
import { updateTutorPreferences } from "../services/preferences.service";
import type { SettingsActionResult } from "../types";

export async function savePreferencesAction(
  _prevState: SettingsActionResult | null,
  formData: FormData,
): Promise<SettingsActionResult> {
  const user = await authorizeAction(["tutor", "admin", "super_admin"]);
  const parsed = preferencesFormSchema.safeParse({
    emailOnSubmission: formData.get("emailOnSubmission") === "on",
    emailOnAnnouncementReply: formData.get("emailOnAnnouncementReply") === "on",
    weeklyDigest: formData.get("weeklyDigest") === "on",
  });

  if (!parsed.success) {
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  const result = await updateTutorPreferences(parsed.data);

  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath(
    `/${user.role === "super_admin" ? "super-admin" : user.role}/settings`,
  );
  return { ok: true, message: "Preferences saved." };
}
