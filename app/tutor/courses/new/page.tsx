import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { CreateCourseForm } from "@/modules/tutor/features/course-builder";

export const metadata: Metadata = { title: "New Course" };

export default function NewCoursePage() {
  return (
    <div className="max-w-xl">
      <PageHeader title="Create a new course" description="Set up the basics — you can add modules and lessons next" />
      <CreateCourseForm />
    </div>
  );
}
