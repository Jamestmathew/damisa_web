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
    label: "Course Builder",
    href: TUTOR_ROUTES.newCourse,
    icon: "courseBuilder",
  },
  {
    label: "Students",
    href: TUTOR_ROUTES.students,
    icon: "users",
  },
  {
    label: "Assignments",
    href: TUTOR_ROUTES.assignments,
    icon: "assignments",
    matchPrefix: true,
  },
  {
    label: "Quizzes",
    href: TUTOR_ROUTES.quizzes,
    icon: "quizzes",
    matchPrefix: true,
  },
  {
    label: "Exams",
    href: TUTOR_ROUTES.exams,
    icon: "exams",
  },
  {
    label: "Gradebook",
    href: TUTOR_ROUTES.gradebook,
    icon: "gradebook",
  },
  {
    label: "Attendance",
    href: TUTOR_ROUTES.attendance,
    icon: "attendance",
  },
  {
    label: "Knowledge Base",
    href: TUTOR_ROUTES.knowledgeBase,
    icon: "knowledgeBase",
    matchPrefix: true,
  },
  {
    label: "Announcements",
    href: TUTOR_ROUTES.announcements,
    icon: "announcements",
  },
  {
    label: "Schedule",
    href: TUTOR_ROUTES.schedule,
    icon: "timetable",
  },
  {
    label: "Reports",
    href: TUTOR_ROUTES.reports,
    icon: "reports",
  },
  {
    label: "Settings",
    href: TUTOR_ROUTES.settings,
    icon: "settings",
  },
  {
    label: "Change password",
    href: "/settings/change-password",
    icon: "shield",
  },
];
