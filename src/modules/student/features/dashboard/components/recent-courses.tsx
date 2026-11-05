import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CourseCard } from "@/modules/student/features/courses/components/course-card";
import { STUDENT_ROUTES } from "@/modules/student/shared/constants";
import type { CourseSummary } from "@/modules/student/shared/types";

export function RecentCourses({ courses }: { courses: CourseSummary[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">My Courses</CardTitle>
        <Link href={STUDENT_ROUTES.courses} className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </CardContent>
    </Card>
  );
}
