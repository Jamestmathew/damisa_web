import {
  Award,
  BarChart3,
  BookOpen,
  Building2,
  CalendarCheck,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  Crown,
  Database,
  FileBarChart,
  GraduationCap,
  HelpCircle,
  History,
  Hammer,
  LayoutDashboard,
  Megaphone,
  Presentation,
  School,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

export const iconMap = {
  // Shared / Brand
  dashboard: LayoutDashboard,
  crown: Crown,
  shield: ShieldCheck,
  graduation: GraduationCap,
  presentation: Presentation,
  sparkles: Sparkles,
  settings: Settings,
  building: Building2,

  // Admin
  users: Users,
  students: GraduationCap,
  teachers: Presentation,
  courses: BookOpen,
  departments: Building2,
  classes: School,
  admissions: ClipboardCheck,
  reports: FileBarChart,
  analytics: BarChart3,
  finance: Wallet,
  announcements: Megaphone,
  history: History,

  // Tutor
  courseBuilder: Hammer,
  gradebook: BarChart3,
  knowledgeBase: Database,

  // Student
  assignments: ClipboardList,
  quizzes: HelpCircle,
  exams: GraduationCap,
  grades: BarChart3,
  payments: Wallet,
  attendance: CalendarCheck,
  timetable: CalendarClock,
  certificates: Award,
  progress: TrendingUp,
} as const;

export type IconName = keyof typeof iconMap;
