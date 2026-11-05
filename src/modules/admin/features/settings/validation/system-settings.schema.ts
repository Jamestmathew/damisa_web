import { z } from "zod";

export const systemSettingsSchema = z.object({
  institutionName: z.string().min(2, "Institution name is required"),
  academicSession: z.string().min(4, "Academic session is required"),
  supportEmail: z.string().email("Enter a valid email address"),
  allowManualPaymentRecording: z.boolean(),
});

export type SystemSettingsSchema = z.infer<typeof systemSettingsSchema>;
