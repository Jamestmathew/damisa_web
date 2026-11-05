import type { Metadata } from "next";

import { PageHeader } from "@/modules/student/shared/components";
import { getCourses, CourseBrowser } from "@/modules/student/features/courses";

export const metadata: Metadata = { title: "My Courses" };

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div>
      <PageHeader title="My Courses" description="Everything you're enrolled in this semester" />
      <CourseBrowser courses={courses} />
    </div>
  );
}
