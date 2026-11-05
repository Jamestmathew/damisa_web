import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/shared/components";
import { EmptyState } from "@/shared/components";
import { CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTutorCourses } from "@/modules/tutor/features/courses/services/courses.service";
import { getAttendanceSession, AttendanceMarker } from "@/modules/tutor/features/attendance";
import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";

export const metadata: Metadata = { title: "Attendance" };

interface AttendancePageProps {
  searchParams: Promise<{ course?: string }>;
}

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const { course: courseIdParam } = await searchParams;
  const courses = await getTutorCourses();
  const activeCourseId = courseIdParam ?? courses[0]?.id;
  const session = activeCourseId ? await getAttendanceSession(activeCourseId) : null;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Attendance" description="Mark today's attendance for each course" />

      <div className="mb-4 flex gap-2">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`${TUTOR_ROUTES.attendance}?course=${course.id}`}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              course.id === activeCourseId
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input text-muted-foreground hover:bg-accent"
            )}
          >
            {course.code}
          </Link>
        ))}
      </div>

      {session ? (
        <AttendanceMarker session={session} />
      ) : (
        <EmptyState icon={CalendarCheck} title="No attendance session found" />
      )}
    </div>
  );
}
