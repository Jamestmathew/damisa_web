import type { Metadata } from "next";
import { AccountSettings } from "@/shared/account/account-settings";
import { PageHeader } from "@/shared/components";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  getPreferences,
  ProfilePreferencesForm,
} from "@/modules/student/features/settings";
export const metadata: Metadata = { title: "Settings" };
export default async function Page() {
  const preferences = await getPreferences();
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile, password and appearance"
      />
      <AccountSettings showName={false} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfilePreferencesForm initialValues={preferences.profile} />
        </CardContent>
      </Card>
    </div>
  );
}
