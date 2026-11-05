import "server-only";

import { getAdmins } from "@/modules/super-admin/features/admins/services/admins.service";
import { getOffices } from "@/modules/super-admin/features/offices/services/offices.service";

import type { SuperAdminDashboardData } from "../types";

export async function getSuperAdminDashboardData(founderName: string): Promise<SuperAdminDashboardData> {
  const [admins, offices] = await Promise.all([getAdmins(), getOffices()]);

  const totalStudents = offices.reduce((sum, o) => sum + o.totalStudents, 0);
  const totalRevenue = offices.reduce((sum, o) => sum + o.totalRevenueNaira, 0);
  const activeAdmins = admins.filter((a) => a.status === "active").length;

  return {
    founderFirstName: founderName.split(" ")[0] ?? founderName,
    stats: [
      { label: "Admins", value: String(admins.length), hint: `${activeAdmins} active`, icon: "admins" },
      { label: "Offices", value: String(offices.length), hint: `${offices.filter((o) => o.adminId).length} assigned`, icon: "offices" },
      { label: "Total Students", value: totalStudents.toLocaleString(), hint: "Across all offices", icon: "students" },
      { label: "Total Revenue", value: `₦${(totalRevenue / 1_000_000).toFixed(1)}M`, hint: "Across all offices", icon: "revenue" },
    ],
  };
}
