import type { Metadata } from "next";
import { requireRole } from "@/shared/rbac";
import { AccountSettings } from "@/shared/account/account-settings";
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
export default async function SuperAdminSettingsPage() {
  await requireRole(["super_admin"]);
  const preferences = await getTutorPreferences();
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account and notification preferences"
      />
      <AccountSettings />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>
            Choose your notification preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationPreferencesForm preferences={preferences} />
        </CardContent>
      </Card>
    </div>
  );
}
