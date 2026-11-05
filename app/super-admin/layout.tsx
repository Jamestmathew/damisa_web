import { requireRole } from "@/shared/rbac";
import { SuperAdminShell } from "@/modules/super-admin/layout";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["super_admin"]);

  return (
    <SuperAdminShell founderName={session.name} founderEmail={session.email}>
      {children}
    </SuperAdminShell>
  );
}
