"use client";

import { useRouter } from "next/navigation";
import { GraduationCap, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ConfirmDialog } from "@/shared/components";

import { deleteExamAction } from "../actions/manage-exam.action";
import type { TutorExam } from "../types";

export function TutorExamsList({ exams }: { exams: TutorExam[] }) {
  const router = useRouter();

  if (exams.length === 0) {
    return <EmptyState icon={GraduationCap} title="No exams scheduled" description="Schedule one on the right." />;
  }

  return (
    <div className="space-y-3">
      {exams.map((exam) => (
        <Card key={exam.id}>
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium text-foreground">{exam.title}</p>
              <p className="text-xs text-muted-foreground">
                {exam.courseCode} · {exam.date} at {exam.time} · {exam.venue} · {exam.durationMinutes} min
              </p>
            </div>
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="icon" aria-label={`Delete ${exam.title}`}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              }
              title="Delete exam"
              description={`This will remove "${exam.title}" from the schedule.`}
              confirmLabel="Delete"
              onConfirm={async () => {
                await deleteExamAction(exam.id);
                router.refresh();
              }}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
