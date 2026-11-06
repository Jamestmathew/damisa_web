"use client";

import { UserFormDialog } from "@/modules/admin/features/users/components/user-form-dialog";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Presentation, Ban, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, EntityToolbar, ConfirmDialog } from "@/shared/components";
import { UserStatusBadge } from "@/modules/admin/shared/components";
import type { DataTableColumn } from "@/shared/types";

import { setTeacherStatusAction } from "../actions/set-teacher-status.action";
import type { AdminTeacher } from "../types";

export function TeachersManager({ teachers }: { teachers: AdminTeacher[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(q) ||
        teacher.email.toLowerCase().includes(q) ||
        teacher.department.toLowerCase().includes(q),
    );
  }, [teachers, query]);

  const columns: DataTableColumn<AdminTeacher>[] = [
    {
      key: "name",
      header: "Staff member",
      render: (teacher) => (
        <div>
          <p className="font-medium text-foreground">{teacher.name}</p>
          <p className="text-xs text-muted-foreground">{teacher.email}</p>
        </div>
      ),
    },
    {
      key: "staffType",
      header: "Staff type",
      render: (teacher) =>
        teacher.staffType === "intern" ? "Intern" : "Instructor",
    },
    {
      key: "courses",
      header: "Courses",
      render: (teacher) => teacher.coursesAssigned,
    },
    {
      key: "status",
      header: "Status",
      render: (teacher) => <UserStatusBadge status={teacher.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (teacher) => (
        <div className="flex justify-end gap-1">
          <UserFormDialog
            user={{
              id: teacher.id,
              name: teacher.name,
              email: teacher.email,
              role: "tutor",
              status: teacher.status,
              matricNumber: null,
              staffId: teacher.staffId,
              staffType: teacher.staffType,
              createdAt: teacher.joinedAt,
            }}
            trigger={
              <Button variant="outline" size="sm">
                Edit
              </Button>
            }
            onSaved={() => router.refresh()}
          />
          {teacher.status === "suspended" ? (
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Reactivate ${teacher.name}`}
                >
                  <CheckCircle2 className="size-4 text-success" />
                </Button>
              }
              title="Reactivate teacher"
              description={`${teacher.name} will regain access to their account.`}
              confirmLabel="Reactivate"
              onConfirm={async () => {
                await setTeacherStatusAction(teacher.id, "active");
                router.refresh();
              }}
            />
          ) : (
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Suspend ${teacher.name}`}
                >
                  <Ban className="size-4 text-destructive" />
                </Button>
              }
              title="Suspend teacher"
              description={`${teacher.name} will lose access to their account until reactivated.`}
              confirmLabel="Suspend"
              onConfirm={async () => {
                await setTeacherStatusAction(teacher.id, "suspended");
                router.refresh();
              }}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <EntityToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search teachers..."
        action={
          <UserFormDialog
            initialRole="tutor"
            trigger={<Button>Add tutor</Button>}
            onSaved={() => router.refresh()}
          />
        }
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(teacher) => teacher.id}
        emptyIcon={Presentation}
        emptyTitle="No teachers found"
      />
    </div>
  );
}
