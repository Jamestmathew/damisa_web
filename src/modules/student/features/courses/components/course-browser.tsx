"use client";

import { useMemo, useState } from "react";

import type { CourseSummary } from "@/modules/student/shared/types";

import { CourseFilterBar } from "./course-filter-bar";
import { CourseList } from "./course-list";

export function CourseBrowser({ courses }: { courses: CourseSummary[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(q) ||
        course.code.toLowerCase().includes(q) ||
        course.instructor.toLowerCase().includes(q)
    );
  }, [courses, query]);

  return (
    <div>
      <CourseFilterBar value={query} onChange={setQuery} />
      <CourseList courses={filtered} />
    </div>
  );
}
