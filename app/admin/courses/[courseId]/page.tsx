import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/shared/rbac";
import { getRecord } from "@/shared/data/records";
import { CourseMaterials } from "@/shared/course-materials/panel";
import { PageHeader } from "@/shared/components";
import { Badge } from "@/components/ui/badge";
import type { TutorCourseDetails } from "@/modules/tutor/features/courses/types";
export default async function Page({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  await requireRole(["admin"]);
  const { courseId } = await params;
  const course = await getRecord<TutorCourseDetails>("course", courseId);
  if (!course) notFound();
  return (
    <div className="max-w-3xl space-y-6">
      <Link className="text-sm text-primary underline" href="/admin/courses">
        Back to courses
      </Link>
      <PageHeader
        title={course.title}
        description={`${course.code} · ${course.instructorName ?? "Assigned tutor"}`}
        action={<Badge variant="outline">{course.status}</Badge>}
      />
      <p className="text-sm text-muted-foreground">{course.description}</p>
      <CourseMaterials courseId={courseId} editable />
    </div>
  );
}
