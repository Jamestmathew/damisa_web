"use client";
import { DeleteAccountButton } from "@/modules/super-admin/features/accounts/delete-account-button";
import { useMemo, useState } from "react";
import { GraduationCap } from "lucide-react";
import { DataTable, EntityToolbar } from "@/shared/components";
import type { DataTableColumn } from "@/shared/types";
import type { PlatformStudent } from "../services/students.service";
export function PlatformStudentsTable({
  students,
}: {
  students: PlatformStudent[];
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      students.filter((s) =>
        `${s.name} ${s.matricNumber} ${s.officeName} ${s.classNames.join(" ")}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ),
    [students, query],
  );
  const money = (n: number | null) =>
    n === null ? "Not set" : `₦${n.toLocaleString()}`;
  const columns: DataTableColumn<PlatformStudent>[] = [
    {
      key: "student",
      header: "Student",
      render: (s) => (
        <div>
          <p className="font-medium">{s.name}</p>
          <p className="text-xs text-muted-foreground">{s.matricNumber}</p>
        </div>
      ),
    },
    { key: "office", header: "Company / office", render: (s) => s.officeName },
    {
      key: "classes",
      header: "Classes",
      render: (s) => s.classNames.join(", ") || "Not assigned",
    },
    { key: "status", header: "Status", render: (s) => s.status },
    {
      key: "fees",
      header: "Total fees",
      render: (s) => money(s.totalDueNaira),
    },
    { key: "paid", header: "Paid", render: (s) => money(s.paidNaira) },
    {
      key: "remaining",
      header: "Balance",
      render: (s) => money(s.remainingNaira),
    },
    {
      key: "attendance",
      header: "Attendance",
      render: (s) =>
        s.attendancePercent === null ? "—" : `${s.attendancePercent}%`,
    },
    {
      key: "progress",
      header: "Lessons completed",
      render: (s) => s.completedLessons,
    },
    {
      key: "delete",
      header: "",
      render: (s) => (
        <DeleteAccountButton id={s.id} name={s.name} role="student" />
      ),
    },
  ];
  return (
    <div>
      <EntityToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search student, matric, company, or class..."
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(s) => s.id}
        emptyIcon={GraduationCap}
        emptyTitle="No students found"
      />
    </div>
  );
}
