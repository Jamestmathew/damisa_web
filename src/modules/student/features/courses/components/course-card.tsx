import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STUDENT_ROUTES } from "@/modules/student/shared/constants";
import type { CourseSummary } from "@/modules/student/shared/types";

import { CourseProgressBar } from "./course-progress-bar";

export function CourseCard({ course }: { course: CourseSummary }) {
  return (
    <Link href={STUDENT_ROUTES.courseDetails(course.id)}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <div
          className={`flex h-24 items-center justify-center rounded-t-lg ${course.thumbnailColor}`}
        >
          {course.coverUrl ? (
            <Image
              unoptimized
              src={course.coverUrl}
              alt={`${course.title} cover`}
              width={480}
              height={192}
              className="h-full w-full rounded-t-lg object-cover"
            />
          ) : (
            <BookOpen className="size-8 text-white/90" />
          )}
        </div>
        <CardContent className="space-y-3 p-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-foreground">
                {course.title}
              </p>
              <Badge variant="outline">{course.code}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{course.instructor}</p>
          </div>
          <CourseProgressBar percent={course.progressPercent} />
        </CardContent>
      </Card>
    </Link>
  );
}
