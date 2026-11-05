"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, EntityToolbar, ConfirmDialog } from "@/shared/components";
import type { DataTableColumn } from "@/shared/types";

import { deleteDepartmentAction } from "../actions/delete-department.action";
import type { Department } from "../types";

import { DepartmentFormDialog } from "./department-form-dialog";

export function DepartmentsManager({ departments }: { departments: Department[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter(
      (d) => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)
    );
  }, [departments, query]);

  const columns: DataTableColumn<Department>[] = [
    {
      key: "name",
      header: "Department",
      render: (d) => (
        <div>
          <p className="font-medium text-foreground">{d.name}</p>
          <p className="text-xs text-muted-foreground">{d.code}</p>
        </div>
      ),
    },
    { key: "head", header: "Head of Department", render: (d) => d.headOfDepartment },
    { key: "courses", header: "Courses", render: (d) => d.courseCount },
    { key: "teachers", header: "Teachers", render: (d) => d.teacherCount },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (d) => (
        <div className="flex justify-end gap-1">
          <DepartmentFormDialog
            department={d}
            onSaved={() => router.refresh()}
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Edit ${d.name}`}>
                <Pencil className="size-4" />
              </Button>
            }
          />
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Delete ${d.name}`}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            }
            title="Delete department"
            description={`This will permanently remove ${d.name}.`}
            confirmLabel="Delete"
            onConfirm={async () => {
              await deleteDepartmentAction(d.id);
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
        searchPlaceholder="Search departments..."
        action={
          <DepartmentFormDialog
            onSaved={() => router.refresh()}
            trigger={
              <Button>
                <Plus className="size-4" />
                Add department
              </Button>
            }
          />
        }
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(d) => d.id}
        emptyIcon={Building2}
        emptyTitle="No departments found"
      />
    </div>
  );
}
