import { Badge } from "@/components/ui/badge";
import type { CoursePublishStatus } from "../types";

const LABEL: Record<CoursePublishStatus, string> = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
};

const VARIANT: Record<CoursePublishStatus, "success" | "secondary" | "outline"> = {
  published: "success",
  draft: "secondary",
  archived: "outline",
};

export function CoursePublishBadge({ status }: { status: CoursePublishStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
