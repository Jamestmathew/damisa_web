import "server-only";
import { getOfficePeople } from "@/shared/data/people";
import { listRecords } from "@/shared/data/records";
import { getPayments } from "@/modules/admin/features/finance/services/finance.service";
import { getAdmissionApplications } from "@/modules/admin/features/admissions/services/admissions.service";
import { getActivityLogs } from "@/modules/admin/features/activity-logs/services/activity-logs.service";
import type { AdminDashboardData } from "../types";
export async function getAdminDashboardData(
  adminName: string,
): Promise<AdminDashboardData> {
  const [people, courses, payments, admissions, activities, announcements] =
    await Promise.all([
      getOfficePeople(),
      listRecords<{ status: string }>("course"),
      getPayments(),
      getAdmissionApplications(),
      getActivityLogs(),
      listRecords<{ title: string; postedAt: string }>("announcement"),
    ]);
  const revenue = payments
    .filter((p) => p.status === "paid")
    .reduce((n, p) => n + p.amountNaira, 0);
  return {
    adminFirstName: adminName.split(" ")[0] ?? adminName,
    stats: [
      { label: "Total Users", value: String(people.length), icon: "users" },
      {
        label: "Students",
        value: String(people.filter((p) => p.role === "student").length),
        icon: "students",
      },
      {
        label: "Tutors",
        value: String(people.filter((p) => p.role === "tutor").length),
        icon: "teachers",
      },
      {
        label: "Published Courses",
        value: String(courses.filter((c) => c.status === "published").length),
        icon: "courses",
      },
      {
        label: "Recorded Income",
        value: `₦${revenue.toLocaleString()}`,
        icon: "revenue",
      },
      {
        label: "Pending Admissions",
        value: String(admissions.filter((a) => a.status === "pending").length),
        icon: "admissions",
      },
    ],
    enrollmentTrend: [],
    revenueTrend: [],
    activeUsersCount: people.filter((p) => p.status === "active").length,
    activeUsersDelta: "Active accounts in your office",
    recentAdmissions: admissions.slice(-5),
    recentPayments: payments.slice(-5),
    pendingApprovals: admissions
      .filter((a) => a.status === "pending")
      .map((a) => ({
        id: a.id,
        title: a.applicantName,
        type: "admission",
        requestedAt: a.submittedAt,
      })),
    recentActivities: activities.slice(-5),
    announcements,
  };
}
