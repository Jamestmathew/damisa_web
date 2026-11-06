import { getAccountAppearance } from "@/shared/account/appearance.service";
import { ApplyAppearance } from "@/shared/layout/appearance";
import { requireRole } from "@/shared/rbac";
import { SuperAdminShell } from "@/modules/super-admin/layout";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["super_admin"]);

  const appearance = await getAccountAppearance();
  return (
    <SuperAdminShell
      key={String(appearance.compactSidebar)}
      compactSidebar={appearance.compactSidebar}
      founderName={session.name}
      founderEmail={session.email}
    >
      <ApplyAppearance preferences={appearance} />
      {children}
    </SuperAdminShell>
  );
}
