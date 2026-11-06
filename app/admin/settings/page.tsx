import type { Metadata } from "next";
import Link from "next/link";
import { AccountSettings } from "@/shared/account/account-settings";
import { PageHeader } from "@/shared/components";
import {
  getSystemSettings,
  SystemSettingsForm,
} from "@/modules/admin/features/settings";
export const metadata: Metadata = { title: "Settings" };
export default async function Page() {
  const settings = await getSystemSettings();
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account, appearance and institution settings"
      />
      <AccountSettings />
      <Link
        href="/admin/my-attendance"
        className="block rounded-lg border bg-card p-4 font-medium text-primary"
      >
        My attendance: sign in / sign out
      </Link>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Institution settings</h2>
        <SystemSettingsForm settings={settings} />
      </section>
    </div>
  );
}
