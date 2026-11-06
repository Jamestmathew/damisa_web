import { RoleShell } from "@/shared/layout";
import { logoutAction } from "@/modules/auth/actions/logout.action";
import { ADMIN_ROUTES } from "@/modules/admin/shared/constants";

import { adminNavConfig } from "./nav-config";

interface AdminShellProps {
  adminName: string;
  adminEmail: string;
  compactSidebar?: boolean;
  children: React.ReactNode;
}

export function AdminShell({
  adminName,
  adminEmail,
  children,
  compactSidebar = false,
}: AdminShellProps) {
  return (
    <RoleShell
      compactSidebar={compactSidebar}
      navItems={adminNavConfig}
      homeHref={ADMIN_ROUTES.dashboard}
      brandLabel="Admin Console"
      brandIcon="shield"
      userName={adminName}
      userEmail={adminEmail}
      logoutAction={logoutAction}
    >
      {children}
    </RoleShell>
  );
}
