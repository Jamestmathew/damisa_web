import "server-only";
import { requireAuth } from "@/modules/auth/lib/route-guard";
import { createAdminClient } from "@/supabase/admin";
import { listRecords, saveRecord } from "@/shared/data/records";
import type { TutorPreferences } from "../types";
export async function getTutorPreferences(): Promise<TutorPreferences> {
  const user = await requireAuth();
  if (user.role !== "tutor") {
    const { data, error } = await createAdminClient().auth.admin.getUserById(
      user.id,
    );
    if (error) throw new Error("Unable to load notification preferences.");
    const saved = data.user?.user_metadata?.notificationPreferences ?? {};
    return {
      emailOnSubmission: saved.emailOnSubmission ?? true,
      emailOnAnnouncementReply: saved.emailOnAnnouncementReply ?? false,
      weeklyDigest: saved.weeklyDigest ?? true,
    };
  }
  return (
    (await listRecords<TutorPreferences>("preferences"))[0] ?? {
      emailOnSubmission: true,
      emailOnAnnouncementReply: false,
      weeklyDigest: true,
    }
  );
}
export async function updateTutorPreferences(
  input: TutorPreferences,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireAuth();
  if (user.role !== "tutor") {
    const db = createAdminClient();
    const { data, error } = await db.auth.admin.getUserById(user.id);
    if (error || !data.user)
      return { ok: false, error: "Unable to load your account." };
    const updated = await db.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...data.user.user_metadata,
        notificationPreferences: input,
      },
    });
    return updated.error
      ? { ok: false, error: "Unable to save preferences." }
      : { ok: true };
  }
  const existing = (await listRecords("preferences"))[0];
  await saveRecord("preferences", input, existing?.id);
  return { ok: true as const };
}
