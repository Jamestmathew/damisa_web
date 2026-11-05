import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import {
  getAdmins,
  AdminsManager,
} from "@/modules/super-admin/features/admins";

export const metadata: Metadata = {
  title: "Admins",
};

export default async function SuperAdminAdminsPage() {
  const admins = await getAdmins();

  return (
    <div>
      <PageHeader
        title="Admin Management"
        description="Create, assign, and oversee Admin accounts"
      />

      <AdminsManager admins={admins} />
    </div>
  );
}
