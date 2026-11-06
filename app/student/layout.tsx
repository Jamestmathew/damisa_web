import { getAccountAppearance } from "@/shared/account/appearance.service";
import { ApplyAppearance } from "@/shared/layout/appearance";
import { requireRole } from "@/shared/rbac";
import { StudentShell } from "@/modules/student/layout";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["student"]);

  const appearance = await getAccountAppearance();

  return (
    <StudentShell
      key={String(appearance.compactSidebar)}
      compactSidebar={appearance.compactSidebar}
      studentName={session.name}
      studentEmail={session.matricNumber ?? ""}
    >
      <ApplyAppearance preferences={appearance} />
      {children}
    </StudentShell>
  );
}
