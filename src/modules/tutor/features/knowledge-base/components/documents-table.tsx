"use client";

import { useRouter } from "next/navigation";
import { FileText, RefreshCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, ConfirmDialog } from "@/shared/components";
import type { DataTableColumn } from "@/shared/types";

import { deleteDocumentAction, reindexDocumentAction } from "../actions/manage-document.action";
import type { KnowledgeDocument } from "../types";

import { DocumentStatusBadge } from "./document-status-badge";

export function DocumentsTable({ documents }: { documents: KnowledgeDocument[] }) {
  const router = useRouter();

  const columns: DataTableColumn<KnowledgeDocument>[] = [
    {
      key: "file",
      header: "Document",
      render: (doc) => (
        <div>
          <p className="font-medium text-foreground">{doc.fileName}</p>
          <p className="text-xs text-muted-foreground">
            {doc.courseTitle} · {doc.fileSizeMb.toFixed(1)}MB · Uploaded {doc.uploadedAt}
          </p>
        </div>
      ),
    },
    { key: "status", header: "Status", render: (doc) => <DocumentStatusBadge status={doc.processingStatus} /> },
    {
      key: "chunks",
      header: "Chunks",
      render: (doc) => (doc.chunkCount !== null ? doc.chunkCount : "—"),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (doc) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Re-index ${doc.fileName}`}
            disabled={doc.processingStatus === "processing"}
            onClick={async () => {
              await reindexDocumentAction(doc.id);
              router.refresh();
            }}
          >
            <RefreshCcw className="size-4" />
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Delete ${doc.fileName}`}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            }
            title="Delete document"
            description={`This will permanently remove "${doc.fileName}" from the knowledge base.`}
            confirmLabel="Delete"
            onConfirm={async () => {
              await deleteDocumentAction(doc.id);
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
      rows={documents}
      getRowId={(doc) => doc.id}
      emptyIcon={FileText}
      emptyTitle="No documents uploaded yet"
      emptyDescription="Upload course materials above to power your course's AI chat."
    />
  );
}
