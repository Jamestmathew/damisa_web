import { getPreferences } from "@/modules/student/features/settings/services/settings.service";
import { ApplyAppearance } from "@/shared/layout/appearance";
import { requireRole } from "@/shared/rbac";
import { StudentShell } from "@/modules/student/layout";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["student"]);

  const preferences = await getPreferences();

  return (
    <StudentShell
      key={String(preferences.appearance.compactSidebar)}
      compactSidebar={preferences.appearance.compactSidebar}
      studentName={session.name}
      studentEmail={session.matricNumber ?? ""}
    >
      <ApplyAppearance preferences={preferences.appearance} />
      {children}
    </StudentShell>
  );
}
