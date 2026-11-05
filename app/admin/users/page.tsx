import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getUsers, UsersManager } from "@/modules/admin/features/users";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      <PageHeader title="User Management" description="Manage every account across the platform" />
      <UsersManager users={users} />
    </div>
  );
}
