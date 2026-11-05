import { z } from "zod";

export const preferencesFormSchema = z.object({
  emailOnSubmission: z.boolean(),
  emailOnAnnouncementReply: z.boolean(),
  weeklyDigest: z.boolean(),
});

export type PreferencesFormSchema = z.infer<typeof preferencesFormSchema>;
