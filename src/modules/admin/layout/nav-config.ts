import { ADMIN_ROUTES } from "@/modules/admin/shared/constants";
import type { RoleNavItem } from "@/shared/layout";

export const adminNavConfig: RoleNavItem[] = [
  {
    label: "Tutor approvals",
    href: "/admin/tutor-attendance",
    icon: "attendance",
  },
  {
    label: "Student attendance",
    href: "/admin/attendance",
    icon: "attendance",
  },
  { label: "My attendance", href: "/admin/my-attendance", icon: "attendance" },
  {
    label: "Dashboard",
    href: ADMIN_ROUTES.dashboard,
    icon: "dashboard",
  },
  {
    label: "Users",
    href: ADMIN_ROUTES.users,
    icon: "users",
    matchPrefix: true,
  },
  {
    label: "Students",
    href: ADMIN_ROUTES.students,
    icon: "students",
    matchPrefix: true,
  },
  {
    label: "Teachers",
    href: ADMIN_ROUTES.teachers,
    icon: "teachers",
    matchPrefix: true,
  },
  {
    label: "Courses",
    href: ADMIN_ROUTES.courses,
    icon: "courses",
    matchPrefix: true,
  },
  {
    label: "Departments",
    href: ADMIN_ROUTES.departments,
    icon: "departments",
    matchPrefix: true,
  },
  {
    label: "Classes",
    href: ADMIN_ROUTES.classes,
    icon: "classes",
    matchPrefix: true,
  },
  {
    label: "Admissions",
    href: ADMIN_ROUTES.admissions,
    icon: "admissions",
    matchPrefix: true,
  },
  {
    label: "Reports",
    href: ADMIN_ROUTES.reports,
    icon: "reports",
  },
  {
    label: "Analytics",
    href: ADMIN_ROUTES.analytics,
    icon: "analytics",
  },
  {
    label: "Finance",
    href: ADMIN_ROUTES.finance,
    icon: "finance",
    matchPrefix: true,
  },
  {
    label: "Announcements",
    href: ADMIN_ROUTES.announcements,
    icon: "announcements",
    matchPrefix: true,
  },
  {
    label: "Settings",
    href: ADMIN_ROUTES.settings,
    icon: "settings",
  },
  {
    label: "Change password",
    href: "/settings/change-password",
    icon: "shield",
  },
];
