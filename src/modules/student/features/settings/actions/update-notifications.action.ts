"use server";
import { authorizeAction } from "@/shared/security/action";
import { requireRole } from "@/shared/rbac";

import { revalidatePath } from "next/cache";

import { STUDENT_ROUTES } from "@/modules/student/shared/constants";
import { notificationPreferencesSchema } from "../validation/preferences.schema";
import { updateNotificationPreferences } from "../services/settings.service";
import type { SettingsActionResult } from "../types";

export async function updateNotificationsAction(
  _prevState: SettingsActionResult | null,
  formData: FormData,
): Promise<SettingsActionResult> {
  await authorizeAction(["student"]);
  await requireRole(["student"]);
  try {
    const parsed = notificationPreferencesSchema.safeParse({
      emailNotifications: formData.get("emailNotifications") === "on",
      assignmentReminders: formData.get("assignmentReminders") === "on",
      announcementAlerts: formData.get("announcementAlerts") === "on",
    });

    if (!parsed.success) {
      return { ok: false, error: "Please fix the errors below" };
    }

    await updateNotificationPreferences(parsed.data);
    revalidatePath(STUDENT_ROUTES.settings);

    return { ok: true, message: "Notification preferences updated." };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
