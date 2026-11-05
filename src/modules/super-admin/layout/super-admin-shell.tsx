import { RoleShell } from "@/shared/layout";
import { logoutAction } from "@/modules/auth/actions/logout.action";
import { SUPER_ADMIN_ROUTES } from "@/modules/super-admin/shared/constants";

import { superAdminNavConfig } from "./nav-config";

interface SuperAdminShellProps {
  founderName: string;
  founderEmail: string;
  children: React.ReactNode;
}

export function SuperAdminShell({
  founderName,
  founderEmail,
  children,
}: SuperAdminShellProps) {
  return (
    <RoleShell
      navItems={superAdminNavConfig}
      homeHref={SUPER_ADMIN_ROUTES.dashboard}
      brandLabel="Platform HQ"
      brandIcon="crown"
      userName={founderName}
      userEmail={founderEmail}
      logoutAction={logoutAction}
    >
      {children}
    </RoleShell>
  );
}
