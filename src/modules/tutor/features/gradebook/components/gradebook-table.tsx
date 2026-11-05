"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BarChart3 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, EntityToolbar } from "@/shared/components";
import type { DataTableColumn } from "@/shared/types";

import { overrideGradeAction } from "../actions/override-grade.action";
import type { GradebookRow } from "../types";

function OverallCell({ row }: { row: GradebookRow }) {
  const router = useRouter();
  const [value, setValue] = useState(row.overallPercent.toString());
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;

    startTransition(async () => {
      await overrideGradeAction(row.id, parsed);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20"
        aria-label={`Overall grade for ${row.studentName}`}
      />
      <span className="text-xs text-muted-foreground">
        {row.hasOverride
          ? "Manual total"
          : row.provisional
            ? "Provisional"
            : "Final"}
      </span>
      <Badge variant="outline">
        {row.hasMarks === false ? "—" : row.letterGrade}
      </Badge>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleSave}
        disabled={isPending}
      >
        Save
      </Button>
    </div>
  );
}

export function GradebookTable({ rows }: { rows: GradebookRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.studentName.toLowerCase().includes(q) ||
        row.courseCode.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const columns: DataTableColumn<GradebookRow>[] = [
    { key: "student", header: "Student", render: (row) => row.studentName },
    { key: "course", header: "Course", render: (row) => row.courseCode },
    {
      key: "assignments",
      header: "Assignments",
      render: (row) =>
        row.assignmentAvg !== null ? `${row.assignmentAvg}%` : "—",
    },
    {
      key: "quizzes",
      header: "Quizzes",
      render: (row) => (row.quizAvg !== null ? `${row.quizAvg}%` : "—"),
    },
    {
      key: "ca",
      header: "CA (%)",
      render: (r) =>
        r.caPercent === null || r.caPercent === undefined
          ? "—"
          : `${r.caPercent}%`,
    },
    {
      key: "exam",
      header: "Exam (%)",
      render: (r) => (r.examScore === null ? "—" : `${r.examScore}%`),
    },
    {
      key: "overall",
      header: "Overall",
      render: (row) => <OverallCell row={row} />,
    },
  ];

  return (
    <div>
      <EntityToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search gradebook..."
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(row) => row.id}
        emptyIcon={BarChart3}
        emptyTitle="No grades recorded"
      />
    </div>
  );
}
