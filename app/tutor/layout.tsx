import { requireRole } from "@/shared/rbac";
import { TutorShell } from "@/modules/tutor/layout";

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["tutor"]);

  return (
    <TutorShell tutorName={session.name} tutorEmail={session.email}>
      {children}
    </TutorShell>
  );
}
