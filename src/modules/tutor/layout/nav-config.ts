import { TUTOR_ROUTES } from "@/modules/tutor/shared/constants";
import type { RoleNavItem } from "@/shared/layout";

export const tutorNavConfig: RoleNavItem[] = [
  { label: "My attendance", href: "/tutor/my-attendance", icon: "attendance" },
  {
    label: "Dashboard",
    href: TUTOR_ROUTES.dashboard,
    icon: "dashboard",
  },
  {
    label: "My Courses",
    href: TUTOR_ROUTES.courses,
    icon: "courses",
    matchPrefix: true,
  },
  {
    label: "Students",
    href: TUTOR_ROUTES.students,
    icon: "users",
  },
  {
    label: "Assignments & Projects",
    href: TUTOR_ROUTES.assignments,
    icon: "assignments",
    matchPrefix: true,
  },
  {
    label: "Attendance",
    href: TUTOR_ROUTES.attendance,
    icon: "attendance",
  },
  {
    label: "Announcements",
    href: TUTOR_ROUTES.announcements,
    icon: "announcements",
  },
  {
    label: "Settings",
    href: TUTOR_ROUTES.settings,
    icon: "settings",
  },
];
