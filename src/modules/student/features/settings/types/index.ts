export type AppearanceTheme = "light" | "dark" | "system";

export interface ProfilePreferences {
  displayName: string;
  bio: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  assignmentReminders: boolean;
  announcementAlerts: boolean;
}

export interface AppearancePreferences {
  theme: AppearanceTheme;
  compactSidebar: boolean;
}

export interface StudentPreferences {
  profile: ProfilePreferences;
  notifications: NotificationPreferences;
  appearance: AppearancePreferences;
}

export type SettingsActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Partial<Record<string, string>> };
