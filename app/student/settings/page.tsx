import { ProfilePictureForm } from "@/shared/account/profile-picture-form";
import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/modules/student/shared/components";
import { STUDENT_ROUTES } from "@/modules/student/shared/constants";
import {
  getPreferences,
  ProfilePreferencesForm,
  NotificationPreferencesForm,
  AppearanceSettingsForm,
} from "@/modules/student/features/settings";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const preferences = await getPreferences();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile and preferences"
      />

      <ProfilePictureForm />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>
            How your name and bio appear to instructors and classmates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfilePreferencesForm initialValues={preferences.profile} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>
            Choose what you want to be notified about.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationPreferencesForm
            initialValues={preferences.notifications}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>
            Customize how the student portal looks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppearanceSettingsForm initialValues={preferences.appearance} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Security</CardTitle>
          <CardDescription>Manage your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href={STUDENT_ROUTES.settings + "/change-password"}>
              <KeyRound className="size-4" />
              Change password
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
