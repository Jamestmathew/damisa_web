import { z } from "zod";

export const profilePreferencesSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters").max(60, "Display name is too long"),
  bio: z.string().max(280, "Bio must be 280 characters or fewer").optional().default(""),
});

export type ProfilePreferencesSchema = z.infer<typeof profilePreferencesSchema>;

export const notificationPreferencesSchema = z.object({
  emailNotifications: z.boolean().default(true),
  assignmentReminders: z.boolean().default(true),
  announcementAlerts: z.boolean().default(true),
});

export type NotificationPreferencesSchema = z.infer<typeof notificationPreferencesSchema>;

export const appearancePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  compactSidebar: z.boolean().default(false),
});

export type AppearancePreferencesSchema = z.infer<typeof appearancePreferencesSchema>;
