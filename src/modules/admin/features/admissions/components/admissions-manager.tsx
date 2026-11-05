"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, EntityToolbar, ConfirmDialog } from "@/shared/components";
import { ApprovalStatusBadge } from "@/modules/admin/shared/components";
import type { DataTableColumn } from "@/shared/types";

import { CreateAdmissionDialog } from "./create-admission-dialog";
import { setAdmissionStatusAction } from "../actions/set-admission-status.action";
import type { AdmissionApplication } from "../types";

export function AdmissionsManager({
  applications,
}: {
  applications: AdmissionApplication[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter(
      (application) =>
        application.applicantName.toLowerCase().includes(q) ||
        application.program.toLowerCase().includes(q),
    );
  }, [applications, query]);

  const columns: DataTableColumn<AdmissionApplication>[] = [
    {
      key: "applicant",
      header: "Applicant",
      render: (application) => (
        <div>
          <p className="font-medium text-foreground">
            {application.applicantName}
          </p>
          <p className="text-xs text-muted-foreground">{application.email}</p>
        </div>
      ),
    },
    {
      key: "program",
      header: "Program",
      render: (application) => application.program,
    },
    {
      key: "session",
      header: "Session",
      render: (application) => application.session,
    },
    {
      key: "submitted",
      header: "Submitted",
      render: (application) => application.submittedAt,
    },
    {
      key: "status",
      header: "Status",
      render: (application) => (
        <ApprovalStatusBadge status={application.status} />
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (application) =>
        application.status === "pending" ? (
          <div className="flex justify-end gap-1">
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Approve ${application.applicantName}`}
                >
                  <Check className="size-4 text-success" />
                </Button>
              }
              title="Approve application"
              description={`${application.applicantName} will be approved for ${application.program}.`}
              confirmLabel="Approve"
              onConfirm={async () => {
                await setAdmissionStatusAction(application.id, "approved");
                router.refresh();
              }}
            />
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Reject ${application.applicantName}`}
                >
                  <X className="size-4 text-destructive" />
                </Button>
              }
              title="Reject application"
              description={`${application.applicantName}'s application will be rejected.`}
              confirmLabel="Reject"
              onConfirm={async () => {
                await setAdmissionStatusAction(application.id, "rejected");
                router.refresh();
              }}
            />
          </div>
        ) : null,
    },
  ];

  return (
    <div>
      <EntityToolbar
        action={<CreateAdmissionDialog />}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search applications..."
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(application) => application.id}
        emptyIcon={ClipboardCheck}
        emptyTitle="No applications found"
      />
    </div>
  );
}
