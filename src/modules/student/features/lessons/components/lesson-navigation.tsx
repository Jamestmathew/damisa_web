import { completeLessonAction } from "../actions/complete-lesson.action";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { STUDENT_ROUTES } from "@/modules/student/shared/constants";
import type { LessonDetails } from "../types";

export function LessonNavigation({ lesson }: { lesson: LessonDetails }) {
  return (
    <div className="flex items-center justify-between border-t border-border pt-4">
      {lesson.previousLessonId ? (
        <Button asChild variant="outline" size="sm">
          <Link
            href={STUDENT_ROUTES.lesson(
              lesson.courseId,
              lesson.previousLessonId,
            )}
          >
            <ArrowLeft className="size-4" />
            Previous
          </Link>
        </Button>
      ) : (
        <Button asChild variant="outline" size="sm">
          <Link href={STUDENT_ROUTES.courseDetails(lesson.courseId)}>
            <ArrowLeft className="size-4" />
            Back to course
          </Link>
        </Button>
      )}

      <form
        action={completeLessonAction.bind(null, lesson.courseId, lesson.id)}
      >
        <Button
          type="submit"
          size="sm"
          disabled={lesson.completed}
          variant={lesson.completed ? "secondary" : "default"}
        >
          <CheckCircle2 className="size-4" />
          {lesson.completed ? "Completed" : "Mark as complete"}
        </Button>
      </form>

      {lesson.nextLessonId ? (
        <Button asChild size="sm">
          <Link
            href={STUDENT_ROUTES.lesson(lesson.courseId, lesson.nextLessonId)}
          >
            Next
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      ) : (
        <Button asChild size="sm" variant="outline">
          <Link href={STUDENT_ROUTES.courseDetails(lesson.courseId)}>
            Back to course
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
