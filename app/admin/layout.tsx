import { getAccountAppearance } from "@/shared/account/appearance.service";
import { ApplyAppearance } from "@/shared/layout/appearance";
import { requireRole } from "@/shared/rbac";
import { AdminShell } from "@/modules/admin/layout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["admin"]);

  const appearance = await getAccountAppearance();
  return (
    <AdminShell
      key={String(appearance.compactSidebar)}
      compactSidebar={appearance.compactSidebar}
      adminName={session.name}
      adminEmail={session.email}
    >
      <ApplyAppearance preferences={appearance} />
      {children}
    </AdminShell>
  );
}
