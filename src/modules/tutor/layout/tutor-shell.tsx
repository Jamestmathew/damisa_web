import { RoleShell } from "@/shared/layout";
import { logoutAction } from "@/modules/auth/actions/logout.action";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";

import { tutorNavConfig } from "./nav-config";

interface TutorShellProps {
  tutorName: string;
  tutorEmail: string;
  compactSidebar?: boolean;
  children: React.ReactNode;
}

export function TutorShell({
  tutorName,
  tutorEmail,
  children,
  compactSidebar = false,
}: TutorShellProps) {
  return (
    <RoleShell
      compactSidebar={compactSidebar}
      navItems={tutorNavConfig}
      homeHref={TUTOR_ROUTES.dashboard}
      brandLabel="Tutor Portal"
      brandIcon="presentation"
      userName={tutorName}
      userEmail={tutorEmail}
      logoutAction={logoutAction}
    >
      {children}
    </RoleShell>
  );
}
