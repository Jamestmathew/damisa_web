import type { ApprovalStatus, PaymentStatus } from "@/modules/admin/shared/types";

export interface AdminStat {
  label: string;
  value: string;
  hint?: string;
  icon: "users" | "students" | "teachers" | "courses" | "revenue" | "admissions";
}

export interface EnrollmentPoint {
  month: string;
  count: number;
}

export interface RevenuePoint {
  month: string;
  amountNaira: number;
}

export interface RecentAdmission {
  id: string;
  applicantName: string;
  program: string;
  submittedAt: string;
  status: ApprovalStatus;
}

export interface RecentPayment {
  id: string;
  payerName: string;
  purpose: string;
  amountNaira: number;
  status: PaymentStatus;
}

export interface PendingApproval {
  id: string;
  title: string;
  type: "admission" | "course" | "user" | "leave";
  requestedAt: string;
}

export interface RecentActivity {
  id: string;
  actor: string;
  action: string;
  target: string;
  occurredAt: string;
}

export interface AdminAnnouncementPreview {
  id: string;
  title: string;
  postedAt: string;
}

export interface AdminDashboardData {
  adminFirstName: string;
  stats: AdminStat[];
  enrollmentTrend: EnrollmentPoint[];
  revenueTrend: RevenuePoint[];
  activeUsersCount: number;
  activeUsersDelta: string;
  recentAdmissions: RecentAdmission[];
  recentPayments: RecentPayment[];
  pendingApprovals: PendingApproval[];
  recentActivities: RecentActivity[];
  announcements: AdminAnnouncementPreview[];
}
