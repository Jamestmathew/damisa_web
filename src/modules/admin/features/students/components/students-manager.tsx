"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Ban, CheckCircle2, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, EntityToolbar, ConfirmDialog } from "@/shared/components";
import { UserStatusBadge } from "@/modules/admin/shared/components";
import type { DataTableColumn } from "@/shared/types";

import { setStudentStatusAction } from "../actions/set-student-status.action";
import type { AdminStudent } from "../types";

export function StudentsManager({ students }: { students: AdminStudent[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q) ||
        student.program.toLowerCase().includes(q)
    );
  }, [students, query]);

  const columns: DataTableColumn<AdminStudent>[] = [
    {
      key: "name",
      header: "Student",
      render: (student) => (
        <div>
          <p className="font-medium text-foreground">{student.name}</p>
          <p className="text-xs text-muted-foreground">{student.email}</p>
        </div>
      ),
    },
    { key: "program", header: "Program", render: (student) => student.program },
    { key: "level", header: "Level", render: (student) => student.level },
    { key: "status", header: "Status", render: (student) => <UserStatusBadge status={student.status} /> },
    { key: "enrolledAt", header: "Enrolled", render: (student) => student.enrolledAt },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (student) => (
        <div className="flex justify-end gap-1">
          <Button asChild variant="ghost" size="icon" aria-label={`View ${student.name}'s profile`}>
            <Link href={`/admin/students/${student.id}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          {student.status === "suspended" ? (
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="icon" aria-label={`Reactivate ${student.name}`}>
                  <CheckCircle2 className="size-4 text-success" />
                </Button>
              }
              title="Reactivate student"
              description={`${student.name} will regain access to their account.`}
              confirmLabel="Reactivate"
              onConfirm={async () => {
                await setStudentStatusAction(student.id, "active");
                router.refresh();
              }}
            />
          ) : (
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="icon" aria-label={`Suspend ${student.name}`}>
                  <Ban className="size-4 text-destructive" />
                </Button>
              }
              title="Suspend student"
              description={`${student.name} will lose access to their account until reactivated.`}
              confirmLabel="Suspend"
              onConfirm={async () => {
                await setStudentStatusAction(student.id, "suspended");
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
      <EntityToolbar searchValue={query} onSearchChange={setQuery} searchPlaceholder="Search students..." />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(student) => student.id}
        emptyIcon={GraduationCap}
        emptyTitle="No students found"
      />
    </div>
  );
}
