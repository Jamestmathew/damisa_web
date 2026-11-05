"use client";

import { useRouter } from "next/navigation";
import { FileText, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, ConfirmDialog } from "@/shared/components";
import type { DataTableColumn } from "@/shared/types";

import { deletePolicyAction } from "../actions/manage-policy.action";
import type { PolicyDocument, PolicyProcessingStatus } from "../types";

const STATUS_LABEL: Record<PolicyProcessingStatus, string> = {
  queued: "Queued",
  processing: "Processing",
  indexed: "Indexed",
  failed: "Failed",
};

const STATUS_VARIANT: Record<PolicyProcessingStatus, "outline" | "secondary" | "success" | "destructive"> = {
  queued: "outline",
  processing: "secondary",
  indexed: "success",
  failed: "destructive",
};

export function PoliciesTable({ policies }: { policies: PolicyDocument[] }) {
  const router = useRouter();

  const columns: DataTableColumn<PolicyDocument>[] = [
    {
      key: "title",
      header: "Policy",
      render: (policy) => (
        <div>
          <p className="font-medium text-foreground">{policy.title}</p>
          <p className="text-xs text-muted-foreground">
            {policy.fileName} · {policy.fileSizeMb.toFixed(1)}MB · Uploaded {policy.uploadedAt}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (policy) => <Badge variant={STATUS_VARIANT[policy.processingStatus]}>{STATUS_LABEL[policy.processingStatus]}</Badge>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (policy) => (
        <div className="flex justify-end">
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Delete ${policy.title}`}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            }
            title="Delete policy document"
            description={`This will remove "${policy.title}" from the platform-wide knowledge base.`}
            confirmLabel="Delete"
            onConfirm={async () => {
              await deletePolicyAction(policy.id);
              router.refresh();
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={policies}
      getRowId={(policy) => policy.id}
      emptyIcon={FileText}
      emptyTitle="No policy documents uploaded yet"
      emptyDescription="Upload institutional policies to ground platform-wide AI answers."
    />
  );
}
