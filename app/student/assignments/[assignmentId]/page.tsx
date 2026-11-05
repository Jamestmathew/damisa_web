import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  PageHeader,
  SubmissionStatusBadge,
} from "@/modules/student/shared/components";
import {
  getAssignmentById,
  AssignmentSubmissionForm,
  AssignmentFeedback,
} from "@/modules/student/features/assignments";

export const metadata: Metadata = { title: "Assignment" };

interface AssignmentDetailsPageProps {
  params: Promise<{ assignmentId: string }>;
}

export default async function AssignmentDetailsPage({
  params,
}: AssignmentDetailsPageProps) {
  const { assignmentId } = await params;
  const assignment = await getAssignmentById(assignmentId);

  if (!assignment) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={assignment.title}
        description={`${assignment.courseTitle} · Due ${assignment.dueAt}`}
        action={<SubmissionStatusBadge status={assignment.status} />}
      />

      <Card>
        <CardContent className="space-y-2 p-5">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{assignment.maxScore} points</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {assignment.instructions}
          </p>
        </CardContent>
      </Card>

      {assignment.status === "graded" && assignment.score !== null ? (
        <AssignmentFeedback
          score={assignment.score}
          maxScore={assignment.maxScore}
          feedback={assignment.feedback}
        />
      ) : null}

      {!!assignment.attachments?.length && assignment.submissionId && (
        <div className="space-y-2">
          <h2 className="font-medium">Submitted files</h2>
          {assignment.attachments.map((file, index) => (
            <a
              key={file.path}
              className="block text-sm text-primary underline"
              href={`/api/submissions/${assignment.submissionId}/files/${index}`}
            >
              {file.fileName}
            </a>
          ))}
        </div>
      )}
      <AssignmentSubmissionForm
        existingAttachmentCount={assignment.attachments?.length ?? 0}
        disabled={assignment.status === "graded"}
        assignmentId={assignment.id}
        existingSubmission={assignment.submissionText}
      />
    </div>
  );
}
