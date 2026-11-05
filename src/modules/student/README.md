# Student Module

Self-contained student experience. Everything a student sees lives inside
`src/modules/student`, except globally shared platform features
(Authentication, and future Messaging/Notifications/Profile/Calendar/Search/
Files modules), which this module depends on rather than reimplements.

## Folder structure

```
src/modules/student/
├── layout/              Typed nav config + Sidebar/Header/Breadcrumbs/Footer/
│                        Shell (collapsible desktop sidebar, Sheet-based
│                        mobile drawer, auto-generated breadcrumbs)
├── shared/               Cross-feature types, routes, and UI (PageHeader,
│                        EmptyState, ErrorState, skeleton loaders,
│                        SubmissionStatusBadge/ScheduleStatusBadge)
└── features/
    ├── dashboard/        Widgets: Welcome, Stats, Recent Courses,
    │                     Deadlines, Assignments, Grades, Announcements,
    │                     Calendar Preview, Quick Actions
    ├── courses/          My Courses grid/search + Course Details + modules
    ├── lessons/          Lesson viewer + prev/next navigation
    ├── assignments/       List, details, RHF+Zod submission form + server
    │                     action, graded feedback
    ├── quizzes/           List, taking form (dynamic per-question answers),
    │                     server action, results
    ├── exams/             Schedule + status (read-only)
    ├── grades/            GPA summary, per-course grades, assessment table,
    │                     dependency-free trend chart
    ├── attendance/        Summary + full record table
    ├── timetable/         Weekly grid view
    ├── certificates/      List + preview dialog
    ├── progress/          Overall + per-course + per-skill completion
    ├── announcements/     Pinned/course/school-wide announcements
    └── settings/          Profile, notification, and appearance preference
                          forms (RHF+Zod) + link to Auth's change-password
```

Each feature only has the folders its complexity justifies — e.g. `exams`
and `timetable` are read-only and have no `actions/` or `validation/`;
`assignments`, `quizzes`, and `settings` have forms, so they do.

## Data

Every feature's `services/*.service.ts` is an in-memory mock tagged
`server-only`. Swap the function bodies for real API/DB calls later —
page components and UI already consume the typed return shapes.

## Route protection

`app/(student)/layout.tsx` calls `requireAuth()` from the Auth module and
passes the session into `StudentShell`. No student page manages auth
itself.

## Reused, not duplicated

- Auth's `logoutAction` (header), `ChangePasswordForm` (settings),
  and shared UI (`LoadingButton`, `FormStatusMessage`) power the
  assignment/quiz forms.
- Root `components/ui/*` shadcn primitives (added as needed: Badge,
  Skeleton, Progress, Table, Avatar, Sheet, Dialog, Textarea) are shared
  across both the Auth and Student modules.
