import Link from "next/link";
import type { Metadata } from "next";
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
  getSystemSettings,
  SystemSettingsForm,
} from "@/modules/admin/features/settings";
import {
  getTutorPreferences,
  NotificationPreferencesForm,
} from "@/modules/tutor/features/settings";
export const metadata: Metadata = { title: "Settings" };
export default async function AdminSettingsPage() {
  const [settings, preferences] = await Promise.all([
    getSystemSettings(),
    getTutorPreferences(),
  ]);
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account, preferences and institution settings"
      />
      <AccountSettings />
      <Link
        href="/admin/my-attendance"
        className="block rounded-lg border bg-card p-4 font-medium text-primary"
      >
        My attendance: clock in / out
      </Link>
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
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Institution settings</h2>
        <SystemSettingsForm settings={settings} />
      </section>
    </div>
  );
}
