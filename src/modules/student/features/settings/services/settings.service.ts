import "server-only";
import { listRecords, saveRecord } from "@/shared/data/records";
import { getContext } from "@/shared/security/context";
import { createAdminClient } from "@/supabase/admin";
import type {
  AppearancePreferences,
  NotificationPreferences,
  ProfilePreferences,
  StudentPreferences,
} from "../types";
async function row() {
  return (await listRecords<StudentPreferences>("preferences"))[0];
}
export async function getPreferences(): Promise<StudentPreferences> {
  const { user } = await getContext();
  return (
    (await row()) ?? {
      profile: { displayName: user.name, bio: "" },
      notifications: {
        emailNotifications: true,
        assignmentReminders: true,
        announcementAlerts: true,
      },
      appearance: { theme: "system", compactSidebar: false },
    }
  );
}
async function update(input: Partial<StudentPreferences>) {
  const current = await row();
  const all = await getPreferences();
  await saveRecord("preferences", { ...all, ...input }, current?.id);
  return { ok: true as const };
}
export async function updateProfilePreferences(profile: ProfilePreferences) {
  const { user } = await getContext();
  const { error } = await createAdminClient()
    .from("profiles")
    .update({ name: profile.displayName, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) throw new Error("Unable to update profile.");
  return update({ profile });
}
export async function updateNotificationPreferences(
  notifications: NotificationPreferences,
) {
  return update({ notifications });
}
export async function updateAppearancePreferences(
  appearance: AppearancePreferences,
) {
  return update({ appearance });
}
