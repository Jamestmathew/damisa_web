import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import { TutorCourseCard } from "@/modules/tutor/features/courses/components/course-card";
import type { TutorCourseSummary } from "@/modules/tutor/shared/types";

export function MyCoursesOverview({ courses }: { courses: TutorCourseSummary[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">My Courses</CardTitle>
        <Link href={TUTOR_ROUTES.courses} className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <TutorCourseCard key={course.id} course={course} />
        ))}
      </CardContent>
    </Card>
  );
}
