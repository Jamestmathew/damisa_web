"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClipboardList, Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/shared/components";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";

import type { TutorAssignment } from "../types";

import { AssignmentFormDialog } from "./assignment-form-dialog";

export function AssignmentsManager({
  courseOptions,
  assignments,
}: {
  courseOptions: { id: string; label: string }[];
  assignments: TutorAssignment[];
}) {
  const router = useRouter();

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <AssignmentFormDialog
          courseOptions={courseOptions}
          onSaved={() => router.refresh()}
          trigger={
            <Button>
              <Plus className="size-4" />
              New assignment
            </Button>
          }
        />
      </div>

      {assignments.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No assignments yet" />
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => {
            const gradingPercent =
              assignment.submittedCount === 0 ? 0 : Math.round((assignment.gradedCount / assignment.submittedCount) * 100);

            return (
              <Card key={assignment.id}>
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{assignment.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {assignment.courseCode} · Due {assignment.dueAt} · {assignment.maxScore} pts
                    </p>
                    <div className="mt-2 max-w-xs space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Graded</span>
                        <span>
                          {assignment.gradedCount}/{assignment.submittedCount} submitted
                        </span>
                      </div>
                      <Progress value={gradingPercent} />
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button asChild variant="outline" size="sm">
                      <Link href={TUTOR_ROUTES.assignmentSubmissions(assignment.id)}>Review submissions</Link>
                    </Button>
                    <AssignmentFormDialog
                      courseOptions={courseOptions}
                      assignment={assignment}
                      onSaved={() => router.refresh()}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label={`Edit ${assignment.title}`}>
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
