import { BookOpen } from "lucide-react";

import { EmptyState } from "@/modules/student/shared/components";
import type { CourseSummary } from "@/modules/student/shared/types";

import { CourseCard } from "./course-card";

export function CourseList({ courses }: { courses: CourseSummary[] }) {
  if (courses.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No courses found"
        description="You are not enrolled in any courses matching this search."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
