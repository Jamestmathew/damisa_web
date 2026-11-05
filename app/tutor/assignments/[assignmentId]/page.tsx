import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/shared/components";
import {
  getTutorAssignments,
  getSubmissionsByAssignment,
  SubmissionsGrader,
} from "@/modules/tutor/features/assignments";

export const metadata: Metadata = { title: "Review Submissions" };

interface SubmissionsPageProps {
  params: Promise<{ assignmentId: string }>;
}

export default async function SubmissionsPage({ params }: SubmissionsPageProps) {
  const { assignmentId } = await params;
  const [assignments, submissions] = await Promise.all([
    getTutorAssignments(),
    getSubmissionsByAssignment(assignmentId),
  ]);

  const assignment = assignments.find((a) => a.id === assignmentId);
  if (!assignment) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={assignment.title}
        description={`${assignment.courseCode} · Max score ${assignment.maxScore}`}
      />
      <SubmissionsGrader
        assignmentId={assignment.id}
        maxScore={assignment.maxScore}
        submissions={submissions}
      />
    </div>
  );
}
