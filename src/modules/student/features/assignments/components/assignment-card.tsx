import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { SubmissionStatusBadge } from "@/modules/student/shared/components";
import { STUDENT_ROUTES } from "@/modules/student/shared/constants";
import type { AssignmentSummary } from "../types";

export function AssignmentCard({ assignment }: { assignment: AssignmentSummary }) {
  return (
    <Link href={STUDENT_ROUTES.assignmentDetails(assignment.id)}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{assignment.title}</p>
            <p className="text-xs text-muted-foreground">{assignment.courseTitle}</p>
            <p className="mt-1 text-xs text-muted-foreground">Due {assignment.dueAt} · {assignment.maxScore} pts</p>
          </div>
          <SubmissionStatusBadge status={assignment.status} />
        </CardContent>
      </Card>
    </Link>
  );
}
