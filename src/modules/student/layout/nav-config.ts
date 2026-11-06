import { STUDENT_ROUTES } from "@/modules/student/shared/constants";
import type { StudentNavItem } from "./types";

export const studentNavConfig: StudentNavItem[] = [
  {
    label: "Dashboard",
    href: STUDENT_ROUTES.dashboard,
    icon: "dashboard",
  },
  {
    label: "AI Chat",
    href: STUDENT_ROUTES.aiChat,
    icon: "sparkles",
    matchPrefix: true,
  },
  {
    label: "Courses",
    href: STUDENT_ROUTES.courses,
    icon: "courses",
    matchPrefix: true,
  },
  {
    label: "Assignments & Projects",
    href: STUDENT_ROUTES.assignments,
    icon: "assignments",
    matchPrefix: true,
  },
  {
    label: "Grades",
    href: STUDENT_ROUTES.grades,
    icon: "grades",
  },
  { label: "Payments", href: STUDENT_ROUTES.payments, icon: "payments" },
  {
    label: "Attendance",
    href: STUDENT_ROUTES.attendance,
    icon: "attendance",
  },
  {
    label: "Certificates",
    href: STUDENT_ROUTES.certificates,
    icon: "certificates",
  },
  {
    label: "Progress",
    href: STUDENT_ROUTES.progress,
    icon: "progress",
  },
  {
    label: "Announcements",
    href: STUDENT_ROUTES.announcements,
    icon: "announcements",
  },
  {
    label: "Settings",
    href: STUDENT_ROUTES.settings,
    icon: "settings",
  },
];
