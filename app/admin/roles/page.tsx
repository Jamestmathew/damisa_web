import type { Metadata } from "next";
import { Info } from "lucide-react";

import { PageHeader } from "@/shared/components";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getRolePermissionGroups,
  RolePermissionsTable,
} from "@/modules/admin/features/roles";

export const metadata: Metadata = { title: "Roles & Permissions" };

export default async function RolesPage() {
  const groups = await getRolePermissionGroups();

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="What each role can do across the platform"
      />
      <Alert className="mb-6">
        <Info />
        <AlertDescription>
          Permissions are defined centrally in code (not editable here) so every
          part of the app enforces them consistently. This is a reference view
          of what&apos;s currently granted to each role.
        </AlertDescription>
      </Alert>
      <RolePermissionsTable groups={groups} />
    </div>
  );
}
