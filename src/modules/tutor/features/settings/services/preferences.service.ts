import "server-only";
import { listRecords, saveRecord } from "@/shared/data/records";
import type { TutorPreferences } from "../types";
export async function getTutorPreferences(): Promise<TutorPreferences> {
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
  const existing = (await listRecords("preferences"))[0];
  await saveRecord("preferences", input, existing?.id);
  return { ok: true as const };
}
