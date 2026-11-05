"use server";
import { authorizeAction } from "@/shared/security/action";

import { revalidatePath } from "next/cache";

import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import { preferencesFormSchema } from "../validation/preferences-form.schema";
import { updateTutorPreferences } from "../services/preferences.service";
import type { SettingsActionResult } from "../types";

export async function savePreferencesAction(
  _prevState: SettingsActionResult | null,
  formData: FormData,
): Promise<SettingsActionResult> {
  await authorizeAction(["tutor"]);
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

  revalidatePath(TUTOR_ROUTES.settings);
  return { ok: true, message: "Preferences saved." };
}
