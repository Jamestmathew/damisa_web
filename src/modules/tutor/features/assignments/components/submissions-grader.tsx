"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/shared/components";
import { SubmissionStatusBadge } from "@/modules/tutor/shared/components";
import { Users } from "lucide-react";

import { gradeSubmissionAction } from "../actions/grade-submission.action";
import type { AssignmentSubmission } from "../types";

function SubmissionRow({
  assignmentId,
  submission,
  maxScore,
}: {
  assignmentId: string;
  submission: AssignmentSubmission;
  maxScore: number;
}) {
  const [error, setError] = useState("");
  const [score, setScore] = useState(submission.score?.toString() ?? "");
  const [isPending, startTransition] = useTransition();

  function handleGrade() {
    const parsed = Number(score);
    if (Number.isNaN(parsed)) return;

    startTransition(async () => {
      const result = await gradeSubmissionAction(
        assignmentId,
        submission.id,
        parsed,
      );
      setError(result.ok ? "" : result.error);
    });
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">
            {submission.studentName}
          </p>
          <p className="text-xs text-muted-foreground">
            {submission.submittedAt
              ? `Submitted ${submission.submittedAt}`
              : "Not submitted"}
          </p>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {submission.submissionText ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {submission.submissionText}
            </p>
          ) : null}
          {submission.attachments?.map((file, index) => (
            <a
              key={file.path}
              className="mt-1 block text-sm text-primary underline"
              href={`/api/submissions/${submission.id}/files/${index}`}
            >
              {file.fileName}
            </a>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SubmissionStatusBadge status={submission.status} />
          {submission.status !== "not_submitted" ? (
            <>
              <Input
                type="number"
                min={0}
                max={maxScore}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-20"
                aria-label={`Score for ${submission.studentName}`}
              />
              <Button
                size="sm"
                onClick={handleGrade}
                disabled={isPending || !score}
              >
                Save
              </Button>
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function SubmissionsGrader({
  assignmentId,
  maxScore,
  submissions,
}: {
  assignmentId: string;
  maxScore: number;
  submissions: AssignmentSubmission[];
}) {
  if (submissions.length === 0) {
    return <EmptyState icon={Users} title="No submissions yet" />;
  }

  return (
    <div className="space-y-3">
      {submissions.map((submission) => (
        <SubmissionRow
          key={submission.id}
          assignmentId={assignmentId}
          submission={submission}
          maxScore={maxScore}
        />
      ))}
    </div>
  );
}
