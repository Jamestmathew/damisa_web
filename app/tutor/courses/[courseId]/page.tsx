import { CourseStudents } from "@/shared/course-materials/course-students";
import { CourseMaterials } from "@/shared/course-materials/panel";
import { CreateCourseForm } from "@/modules/tutor/features/course-builder/components/create-course-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/shared/components";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getTutorCourseById } from "@/modules/tutor/features/courses/services/courses.service";
import {
  AddModuleForm,
  PublishToggle,
  CourseBuilderModulesList,
} from "@/modules/tutor/features/course-builder";

export const metadata: Metadata = { title: "Course Builder" };

interface CourseBuilderPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseBuilderPage({
  params,
}: CourseBuilderPageProps) {
  const { courseId } = await params;
  const course = await getTutorCourseById(courseId);

  if (!course) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title={course.title}
        description={`${course.code} · ${course.creditUnits} credit units`}
        action={
          <PublishToggle
            courseId={course.id}
            status={course.status}
            courseTitle={course.title}
          />
        }
      />

      <div className="rounded-lg border bg-muted/30 p-4 text-sm">
        <p>
          Build your lessons, then publish this course. Admin assigns students
          to you; your published courses appear automatically in their portal.
        </p>
        <Button asChild className="mt-3">
          <Link href={`/tutor/courses/${course.id}/lessons`}>
            Build and manage lessons
          </Link>
        </Button>
      </div>
      <details className="rounded-lg border bg-card p-4">
        <summary className="cursor-pointer font-semibold">
          Edit course details
        </summary>
        <div className="mt-4">
          <CreateCourseForm course={course} />
        </div>
      </details>
      <CourseStudents courseId={course.id} />
      <CourseMaterials courseId={course.id} editable />
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Overview</CardTitle>
            <Badge
              variant={course.status === "published" ? "success" : "secondary"}
            >
              {course.status === "published" ? "Published" : "Draft"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>{course.description}</p>
          <p>{course.studentCount} students enrolled</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Modules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CourseBuilderModulesList
            courseId={course.id}
            modules={course.modules}
          />
          <AddModuleForm courseId={course.id} />
        </CardContent>
      </Card>
    </div>
  );
}
