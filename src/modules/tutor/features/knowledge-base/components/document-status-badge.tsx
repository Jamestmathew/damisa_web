import { Badge } from "@/components/ui/badge";
import type { DocumentProcessingStatus } from "../types";

const LABEL: Record<DocumentProcessingStatus, string> = {
  queued: "Queued",
  processing: "Processing",
  indexed: "Indexed",
  failed: "Failed",
};

const VARIANT: Record<DocumentProcessingStatus, "outline" | "secondary" | "success" | "destructive"> = {
  queued: "outline",
  processing: "secondary",
  indexed: "success",
  failed: "destructive",
};

export function DocumentStatusBadge({ status }: { status: DocumentProcessingStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
