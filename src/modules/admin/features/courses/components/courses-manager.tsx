"use client";
import Image from "next/image";
import { AdminCourseDialog } from "./admin-course-dialog";
import { CourseCoverDialog } from "./course-cover-dialog";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Upload, Archive } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, EntityToolbar, ConfirmDialog } from "@/shared/components";
import type { DataTableColumn } from "@/shared/types";

import { setCourseStatusAction } from "../actions/set-course-status.action";
import type { AdminCourse } from "../types";

import { CoursePublishBadge } from "./course-publish-badge";

export function CoursesManager({
  courses,
  tutors,
}: {
  courses: AdminCourse[];
  tutors: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(q) ||
        course.code.toLowerCase().includes(q),
    );
  }, [courses, query]);

  const columns: DataTableColumn<AdminCourse>[] = [
    {
      key: "title",
      header: "Course",
      render: (course) => (
        <div>
          {course.coverUrl && (
            <Image
              unoptimized
              src={course.coverUrl}
              alt={`${course.title} cover`}
              width={96}
              height={64}
              className="mb-2 h-16 w-24 rounded object-cover"
            />
          )}
          <p className="font-medium text-foreground">{course.title}</p>
          <p className="text-xs text-muted-foreground">
            {course.code} · {course.department}
          </p>
        </div>
      ),
    },
    {
      key: "instructor",
      header: "Instructor",
      render: (course) => course.instructor,
    },
    {
      key: "enrolled",
      header: "Enrolled",
      render: (course) => course.enrolledCount,
    },
    {
      key: "status",
      header: "Status",
      render: (course) => <CoursePublishBadge status={course.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (course) => (
        <div className="flex justify-end gap-1">
          <CourseCoverDialog id={course.id} />
          {course.status !== "published" ? (
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Publish ${course.title}`}
                >
                  <Upload className="size-4 text-success" />
                </Button>
              }
              title="Publish course"
              description={`${course.title} will become visible to enrolled students.`}
              confirmLabel="Publish"
              onConfirm={async () => {
                await setCourseStatusAction(course.id, "published");
                router.refresh();
              }}
            />
          ) : null}
          {course.status !== "archived" ? (
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Archive ${course.title}`}
                >
                  <Archive className="size-4 text-muted-foreground" />
                </Button>
              }
              title="Archive course"
              description={`${course.title} will be hidden from students and marked archived.`}
              confirmLabel="Archive"
              onConfirm={async () => {
                await setCourseStatusAction(course.id, "archived");
                router.refresh();
              }}
            />
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div>
      <EntityToolbar
        action={<AdminCourseDialog tutors={tutors} />}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search courses..."
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(course) => course.id}
        emptyIcon={BookOpen}
        emptyTitle="No courses found"
      />
    </div>
  );
}
