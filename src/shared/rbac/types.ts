/**
 * Central role/permission types. This is intentionally the ONLY place
 * `Role` and `Permission` are defined — every module imports from here
 * instead of hardcoding role checks or redefining their own status enum.
 *
 * Adding a new role (e.g. "super_admin") means: add it to `Role`, add a
 * row to `ROLE_PERMISSIONS`, and everything that already calls
 * `hasPermission`/`requirePermission` picks it up automatically. No
 * existing call site needs to change.
 */

export type Role = "student" | "tutor" | "admin" | "super_admin";

/**
 * Every account in the system carries one of these. Authentication must
 * deny sign-in for any status other than "active" — enforced centrally in
 * the Auth module's login, not left to each page to remember.
 */
export type AccountStatus = "active" | "inactive" | "suspended" | "archived";

export type Permission =
  // User & account management (Admin-only today)
  | "users:create"
  | "users:edit"
  | "users:activate"
  | "users:deactivate"
  | "users:archive"
  | "users:reset_password"
  | "users:view_all"
  // Student profile / academic records
  | "students:view_profile"
  | "students:edit_profile"
  | "academic_records:manage"
  // Tutor's own teaching content (distinct from Admin's platform-wide academic_records:manage)
  | "courses:manage_own"
  | "assignments:manage_own"
  | "quizzes:manage_own"
  | "exams:manage_own"
  | "gradebook:manage_own"
  | "attendance:manage_own"
  | "attendance:students"
  | "attendance:staff"
  | "attendance:policy"
  | "attendance:view_self"
  | "attendance:clock_self"
  | "attendance:approve_student_tutor"
  | "attendance:approve_admin"
  // Payments
  | "payments:view_own"
  | "payments:view_all"
  | "payments:record"
  | "payments:verify"
  | "payments:filter"
  // AI governance vs. AI usage — kept distinct so Admin (governs) and
  // Tutor (manages course knowledge) and Student (consumes) never overlap
  | "ai:chat"
  | "ai:manage_knowledge_base"
  | "ai:manage_governance"
  // Super Admin — platform-wide oversight, distinct from Admin's per-institution scope
  | "students:delete"
  | "admins:delete"
  | "admins:create"
  | "admins:edit"
  | "admins:activate"
  | "admins:deactivate"
  | "admins:archive"
  | "offices:view_all"
  | "ai:manage_policies";

/**
 * Where each role lands after sign-in / when redirected away from a
 * guest-only page. Centralized here so login forms, middleware, and
 * `requireGuest` all defer to one lookup instead of each hardcoding a
 * role → path decision. Add a row when a new role is introduced —
 * nothing else needs to change.
 */
export const ROLE_HOME_PATH: Record<Role, string> = {
  student: "/student/dashboard",
  tutor: "/tutor/dashboard",
  admin: "/admin/dashboard",
  super_admin: "/super-admin/dashboard",
};
