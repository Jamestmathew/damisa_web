import Link from "next/link";
import { BookOpen } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import type { TutorCourseSummary } from "@/modules/tutor/shared/types";

export function TutorCourseCard({ course }: { course: TutorCourseSummary }) {
  return (
    <Link href={TUTOR_ROUTES.courseBuilder(course.id)}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-secondary p-2">
                <BookOpen className="size-4 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{course.title}</p>
                <p className="text-xs text-muted-foreground">{course.code}</p>
              </div>
            </div>
            <Badge variant={course.status === "published" ? "success" : "secondary"}>
              {course.status === "published" ? "Published" : "Draft"}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{course.studentCount} students</span>
            <span>{course.moduleCount} modules</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
