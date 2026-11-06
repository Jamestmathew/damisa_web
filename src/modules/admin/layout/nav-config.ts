import type { RoleNavItem } from "@/shared/layout";
export const adminNavConfig: RoleNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  {
    label: "Students",
    href: "/admin/students",
    icon: "students",
    matchPrefix: true,
  },
  {
    label: "Staff",
    href: "/admin/teachers",
    icon: "teachers",
    matchPrefix: true,
  },
  {
    label: "Courses",
    href: "/admin/courses",
    icon: "courses",
    matchPrefix: true,
  },
  {
    label: "Finance",
    href: "/admin/finance",
    icon: "finance",
    matchPrefix: true,
  },
  {
    label: "Student attendance",
    href: "/admin/attendance",
    icon: "attendance",
  },
  {
    label: "Announcements",
    href: "/admin/announcements",
    icon: "announcements",
  },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
];
