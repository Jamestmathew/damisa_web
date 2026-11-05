import { ClipboardList } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState, SubmissionStatusBadge } from "@/modules/student/shared/components";
import type { RecentAssignmentPreview } from "../types";

export function RecentAssignments({ assignments }: { assignments: RecentAssignmentPreview[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No assignments yet" />
        ) : (
          <ul className="space-y-3">
            {assignments.map((assignment) => (
              <li key={assignment.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{assignment.title}</p>
                  <p className="text-xs text-muted-foreground">{assignment.courseTitle}</p>
                </div>
                <SubmissionStatusBadge status={assignment.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
