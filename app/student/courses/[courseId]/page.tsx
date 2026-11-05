import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/modules/student/shared/components";
import {
  getCourseById,
  CourseProgressBar,
  CourseModulesList,
} from "@/modules/student/features/courses";

export const metadata: Metadata = { title: "Course Details" };

interface CourseDetailsPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetailsPage({ params }: CourseDetailsPageProps) {
  const { courseId } = await params;
  const course = await getCourseById(courseId);

  if (!course) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={course.title}
        description={`${course.instructor} · ${course.instructorTitle}`}
        action={<Badge variant="outline">{course.code}</Badge>}
      />

      <div className="max-w-md">
        <CourseProgressBar percent={course.progressPercent} />
      </div>

      <p className="max-w-2xl text-sm text-muted-foreground">{course.description}</p>

      <CourseModulesList courseId={course.id} modules={course.modules} />
    </div>
  );
}
