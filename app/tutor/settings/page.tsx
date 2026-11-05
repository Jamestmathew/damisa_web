import { AccountNameForm } from "@/shared/account/account-name-form";
import { ProfilePictureForm } from "@/shared/account/profile-picture-form";
import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ChangePasswordForm } from "@/modules/auth";
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

      <ProfilePictureForm />
      <AccountNameForm />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
          <CardDescription>
            Update the password used to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

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
