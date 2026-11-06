import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import {
  getTutorAssignments,
  AssignmentsManager,
} from "@/modules/tutor/features/assignments";
import { getTutorCourses } from "@/modules/tutor/features/courses/services/courses.service";

export const metadata: Metadata = { title: "Assignments & Projects" };

export default async function TutorAssignmentsPage() {
  const [assignments, courses] = await Promise.all([
    getTutorAssignments(),
    getTutorCourses(),
  ]);

  return (
    <div>
      <PageHeader
        title="Assignments & Projects"
        description="Create, collect and grade assignments and projects in one place"
      />
      <AssignmentsManager
        assignments={assignments}
        courseOptions={courses.map((c) => ({
          id: c.id,
          label: `${c.code} · ${c.title}`,
        }))}
      />
    </div>
  );
}
