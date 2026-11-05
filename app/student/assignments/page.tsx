import type { Metadata } from "next";

import { PageHeader } from "@/modules/student/shared/components";
import { getAssignments, AssignmentList } from "@/modules/student/features/assignments";

export const metadata: Metadata = { title: "Assignments" };

export default async function AssignmentsPage() {
  const assignments = await getAssignments();

  return (
    <div>
      <PageHeader title="Assignments" description="Track and submit your coursework" />
      <AssignmentList assignments={assignments} />
    </div>
  );
}
