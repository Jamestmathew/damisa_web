import { AccountSettings } from "@/shared/account/account-settings";
import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  getTutorPreferences,
  NotificationPreferencesForm,
} from "@/modules/tutor/features/settings";

export const metadata: Metadata = { title: "Settings" };

export default async function TutorSettingsPage() {
  const preferences = await getTutorPreferences();

  return (
    <div className="max-w-lg space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account and notification preferences"
      />

      <AccountSettings />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Choose what you get emailed about.</CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationPreferencesForm preferences={preferences} />
        </CardContent>
      </Card>
    </div>
  );
}
