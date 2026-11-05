import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { STUDENT_ROUTES } from "@/modules/student/shared/constants";
import type { CourseModule } from "../types";

import { listRecords } from "@/shared/data/records";
import type { TutorLesson } from "@/modules/tutor/features/lessons/types";

export async function CourseModulesList({
  courseId,
}: {
  courseId: string;
  modules: CourseModule[];
}) {
  const lessons = (await listRecords<TutorLesson>("lesson")).filter(
    (l) => l.courseId === courseId,
  );
  return (
    <div className="space-y-3">
      {lessons.length ? (
        lessons.map((lesson) => (
          <Card key={lesson.id}>
            <CardContent className="p-4">
              <Link
                className="text-primary hover:underline"
                href={STUDENT_ROUTES.lesson(courseId, lesson.id)}
              >
                {lesson.title}
              </Link>
              <p className="text-sm text-muted-foreground">
                {lesson.contentType} · {lesson.durationMinutes} minutes
              </p>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">
          Your tutor has not published lessons yet.
        </p>
      )}
    </div>
  );
}
