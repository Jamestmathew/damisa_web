import { ChangePasswordForm } from "@/modules/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import {
  getSystemSettings,
  SystemSettingsForm,
} from "@/modules/admin/features/settings";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const settings = await getSystemSettings();

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="System Settings"
        description="Institution-wide configuration"
      />
      <SystemSettingsForm settings={settings} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change your password</CardTitle>
          <CardDescription>
            Update the password used for your Admin account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
