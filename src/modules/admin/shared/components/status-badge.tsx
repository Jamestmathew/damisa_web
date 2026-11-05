import { Badge } from "@/components/ui/badge";
import type { ApprovalStatus, PaymentStatus, UserStatus } from "../types";

const USER_STATUS_LABEL: Record<UserStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
  archived: "Archived",
};

const USER_STATUS_VARIANT: Record<UserStatus, "success" | "outline" | "destructive" | "secondary"> = {
  active: "success",
  inactive: "outline",
  suspended: "destructive",
  archived: "secondary",
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <Badge variant={USER_STATUS_VARIANT[status]}>{USER_STATUS_LABEL[status]}</Badge>;
}

const APPROVAL_STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const APPROVAL_STATUS_VARIANT: Record<ApprovalStatus, "secondary" | "success" | "destructive"> = {
  pending: "secondary",
  approved: "success",
  rejected: "destructive",
};

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  return <Badge variant={APPROVAL_STATUS_VARIANT[status]}>{APPROVAL_STATUS_LABEL[status]}</Badge>;
}

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
  refunded: "Refunded",
};

const PAYMENT_STATUS_VARIANT: Record<PaymentStatus, "success" | "secondary" | "destructive" | "outline"> = {
  paid: "success",
  pending: "secondary",
  overdue: "destructive",
  refunded: "outline",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={PAYMENT_STATUS_VARIANT[status]}>{PAYMENT_STATUS_LABEL[status]}</Badge>;
}
