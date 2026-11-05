"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Plus, Pencil, Trash2, PlayCircle, FileText, Paperclip } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ConfirmDialog } from "@/shared/components";

import { deleteLessonAction } from "../actions/delete-lesson.action";
import type { TutorLesson } from "../types";

import { LessonFormDialog } from "./lesson-form-dialog";

const CONTENT_ICON = { video: PlayCircle, reading: FileText, resource: Paperclip } as const;

export function LessonsManager({ courseId, lessons }: { courseId: string; lessons: TutorLesson[] }) {
  const router = useRouter();

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <LessonFormDialog
          courseId={courseId}
          onSaved={() => router.refresh()}
          trigger={
            <Button>
              <Plus className="size-4" />
              New lesson
            </Button>
          }
        />
      </div>

      {lessons.length === 0 ? (
        <EmptyState icon={BookOpen} title="No lessons yet" description="Add your first lesson above." />
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => {
            const Icon = CONTENT_ICON[lesson.contentType];
            return (
              <Card key={lesson.id}>
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-secondary p-2">
                      <Icon className="size-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {lesson.moduleTitle} · {lesson.durationMinutes} min
                        {!lesson.published ? " · Draft" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <LessonFormDialog
                      courseId={courseId}
                      lesson={lesson}
                      onSaved={() => router.refresh()}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label={`Edit ${lesson.title}`}>
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="icon" aria-label={`Delete ${lesson.title}`}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      }
                      title="Delete lesson"
                      description={`This will permanently remove "${lesson.title}".`}
                      confirmLabel="Delete"
                      onConfirm={async () => {
                        await deleteLessonAction(lesson.id, courseId);
                        router.refresh();
                      }}
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
