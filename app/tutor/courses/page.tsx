import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/shared/components";
import { Button } from "@/components/ui/button";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import { getTutorCourses, TutorCourseList } from "@/modules/tutor/features/courses";

export const metadata: Metadata = { title: "My Courses" };

export default async function TutorCoursesPage() {
  const courses = await getTutorCourses();

  return (
    <div>
      <PageHeader
        title="My Courses"
        description="Courses you own and manage"
        action={
          <Button asChild>
            <Link href={TUTOR_ROUTES.newCourse}>
              <Plus className="size-4" />
              New course
            </Link>
          </Button>
        }
      />
      <TutorCourseList courses={courses} />
    </div>
  );
}
