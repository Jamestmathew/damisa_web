import { BookOpen } from "lucide-react";

import { EmptyState } from "@/shared/components";
import type { TutorCourseSummary } from "@/modules/tutor/shared/types";

import { TutorCourseCard } from "./course-card";

export function TutorCourseList({ courses }: { courses: TutorCourseSummary[] }) {
  if (courses.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No courses yet"
        description="Create your first course to start building content."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <TutorCourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
