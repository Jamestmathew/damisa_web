import { Card, CardContent } from "@/components/ui/card";
import { UserStatusBadge } from "@/modules/admin/shared/components";
import type { AdminStudentProfile } from "../types";

export function StudentProfileHeader({ student }: { student: AdminStudentProfile }) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{student.name}</h1>
          <p className="text-sm text-muted-foreground">{student.email}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {student.program} · Level {student.level} · Enrolled {student.enrolledAt}
          </p>
        </div>
        <UserStatusBadge status={student.status} />
      </CardContent>
    </Card>
  );
}
