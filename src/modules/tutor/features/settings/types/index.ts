export interface TutorPreferences {
  emailOnSubmission: boolean;
  emailOnAnnouncementReply: boolean;
  weeklyDigest: boolean;
}

export type SettingsActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };
