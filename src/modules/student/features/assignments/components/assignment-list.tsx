import { ClipboardList } from "lucide-react";

import { EmptyState } from "@/modules/student/shared/components";
import type { AssignmentSummary } from "../types";

import { AssignmentCard } from "./assignment-card";

export function AssignmentList({ assignments }: { assignments: AssignmentSummary[] }) {
  if (assignments.length === 0) {
    return <EmptyState icon={ClipboardList} title="No assignments" description="Nothing has been assigned yet." />;
  }

  return (
    <div className="space-y-3">
      {assignments.map((assignment) => (
        <AssignmentCard key={assignment.id} assignment={assignment} />
      ))}
    </div>
  );
}
