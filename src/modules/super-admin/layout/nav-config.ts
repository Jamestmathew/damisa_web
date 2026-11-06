import { SUPER_ADMIN_ROUTES } from "@/modules/super-admin/shared/constants";
import type { RoleNavItem } from "@/shared/layout";

export const superAdminNavConfig: RoleNavItem[] = [
  { label: "Staff & Interns", href: "/super-admin/staff", icon: "users" },
  { label: "Finance reports", href: "/super-admin/finance", icon: "finance" },
  {
    label: "Staff attendance",
    href: "/super-admin/attendance",
    icon: "attendance",
  },
  {
    label: "Dashboard",
    href: SUPER_ADMIN_ROUTES.dashboard,
    icon: "dashboard",
  },
  {
    label: "Companies / Branches",
    href: SUPER_ADMIN_ROUTES.offices,
    icon: "building",
    matchPrefix: true,
  },
  {
    label: "Admins",
    href: SUPER_ADMIN_ROUTES.admins,
    icon: "shield",
    matchPrefix: true,
  },
  {
    label: "Students",
    href: SUPER_ADMIN_ROUTES.students,
    icon: "students",
    matchPrefix: true,
  },
  {
    label: "AI Policies",
    href: SUPER_ADMIN_ROUTES.policies,
    icon: "sparkles",
  },
  { label: "Settings", href: "/super-admin/settings", icon: "settings" },
];
