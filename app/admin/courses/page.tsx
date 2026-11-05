import { getOfficePeople } from "@/shared/data/people";
import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getCourses, CoursesManager } from "@/modules/admin/features/courses";

export const metadata: Metadata = { title: "Courses" };

export default async function AdminCoursesPage() {
  const [courses, people] = await Promise.all([
    getCourses(),
    getOfficePeople(),
  ]);
  const tutors = people
    .filter((p) => p.role === "tutor" && p.status === "active")
    .map((p) => ({ id: p.id, name: p.name }));

  return (
    <div>
      <PageHeader
        title="Course Management"
        description="Oversee every course across departments"
      />
      <CoursesManager tutors={tutors} courses={courses} />
    </div>
  );
}
