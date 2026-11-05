"use client";

import { useMemo, useState } from "react";
import { Users } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { DataTable, EntityToolbar } from "@/shared/components";
import type { DataTableColumn } from "@/shared/types";
import type { TutorStudent } from "../types";

export function TutorStudentsTable({ students }: { students: TutorStudent[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(q) ||
        student.courseCode.toLowerCase().includes(q),
    );
  }, [students, query]);

  const columns: DataTableColumn<TutorStudent>[] = [
    {
      key: "name",
      header: "Student",
      render: (student) => (
        <div>
          <p className="font-medium text-foreground">{student.name}</p>
          <p className="text-xs text-muted-foreground">
            {student.matricNumber || student.email}
          </p>
        </div>
      ),
    },
    {
      key: "course",
      header: "Course",
      render: (student) => student.courseCode,
    },
    {
      key: "progress",
      header: "Progress",
      render: (student) => (
        <div className="w-32 space-y-1">
          <Progress value={student.progressPercent} />
          <span className="text-xs text-muted-foreground">
            {student.progressPercent}%
          </span>
        </div>
      ),
    },
    {
      key: "grade",
      header: "Avg. Grade",
      render: (student) => `${student.averageGrade}%`,
    },
    {
      key: "attendance",
      header: "Attendance",
      render: (student) => `${student.attendancePercent}%`,
    },
  ];

  return (
    <div>
      <EntityToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search students..."
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(student) => student.id}
        emptyIcon={Users}
        emptyTitle="No students found"
      />
    </div>
  );
}
