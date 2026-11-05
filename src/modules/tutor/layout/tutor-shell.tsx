import { RoleShell } from "@/shared/layout";
import { logoutAction } from "@/modules/auth/actions/logout.action";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";

import { tutorNavConfig } from "./nav-config";

interface TutorShellProps {
  tutorName: string;
  tutorEmail: string;
  children: React.ReactNode;
}

export function TutorShell({
  tutorName,
  tutorEmail,
  children,
}: TutorShellProps) {
  return (
    <RoleShell
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
