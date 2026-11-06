import type { Metadata } from "next";
import { requireRole } from "@/shared/rbac";
import { AccountSettings } from "@/shared/account/account-settings";
import { PageHeader } from "@/shared/components";
export const metadata: Metadata = { title: "Settings" };
export default async function Page() {
  await requireRole(["super_admin"]);
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile, password and appearance"
      />
      <AccountSettings />
    </div>
  );
}
