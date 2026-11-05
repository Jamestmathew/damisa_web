"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { School, Plus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, EntityToolbar, ConfirmDialog } from "@/shared/components";
import type { DataTableColumn } from "@/shared/types";

import { deleteClassAction } from "../actions/delete-class.action";
import type { AdminClass } from "../types";

import {
  ClassEnrollmentDialog,
  type EnrollmentOption,
} from "./class-enrollment-dialog";
import { ClassFormDialog } from "./class-form-dialog";

export function ClassesManager({
  classes,
  departmentNames,
  students,
  courses,
}: {
  classes: AdminClass[];
  departmentNames: string[];
  students: EnrollmentOption[];
  courses: EnrollmentOption[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.teacher.toLowerCase().includes(q),
    );
  }, [classes, query]);

  const columns: DataTableColumn<AdminClass>[] = [
    {
      key: "name",
      header: "Class",
      render: (c) => (
        <div>
          <p className="font-medium text-foreground">{c.name}</p>
          <p className="text-xs text-muted-foreground">{c.department}</p>
        </div>
      ),
    },
    { key: "teacher", header: "Teacher", render: (c) => c.teacher },
    { key: "students", header: "Students", render: (c) => c.studentCount },
    { key: "schedule", header: "Schedule", render: (c) => c.schedule },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (c) => (
        <div className="flex justify-end gap-1">
          <ClassEnrollmentDialog
            classItem={c}
            students={students}
            courses={courses}
          />
          <ClassFormDialog
            classItem={c}
            departmentNames={departmentNames}
            onSaved={() => router.refresh()}
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Edit ${c.name}`}>
                <Pencil className="size-4" />
              </Button>
            }
          />
          <ConfirmDialog
            trigger={
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${c.name}`}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            }
            title="Delete class"
            description={`This will permanently remove ${c.name}.`}
            confirmLabel="Delete"
            onConfirm={async () => {
              await deleteClassAction(c.id);
              router.refresh();
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <EntityToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search classes..."
        action={
          <ClassFormDialog
            departmentNames={departmentNames}
            onSaved={() => router.refresh()}
            trigger={
              <Button>
                <Plus className="size-4" />
                Add class
              </Button>
            }
          />
        }
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(c) => c.id}
        emptyIcon={School}
        emptyTitle="No classes found"
      />
    </div>
  );
}
