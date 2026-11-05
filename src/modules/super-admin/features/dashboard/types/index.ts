export interface SuperAdminStat {
  label: string;
  value: string;
  hint?: string;
  icon: "admins" | "offices" | "students" | "revenue";
}

export interface SuperAdminDashboardData {
  founderFirstName: string;
  stats: SuperAdminStat[];
}
