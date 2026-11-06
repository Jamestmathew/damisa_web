import { getAccountAppearance } from "@/shared/account/appearance.service";
import { ApplyAppearance } from "@/shared/layout/appearance";
import { requireRole } from "@/shared/rbac";
import { TutorShell } from "@/modules/tutor/layout";

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["tutor"]);

  const appearance = await getAccountAppearance();
  return (
    <TutorShell
      key={String(appearance.compactSidebar)}
      compactSidebar={appearance.compactSidebar}
      tutorName={session.name}
      tutorEmail={session.email}
    >
      <ApplyAppearance preferences={appearance} />
      {children}
    </TutorShell>
  );
}
