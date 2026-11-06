# SMI MVP workflows

## Admin
- Students: create, view, edit, suspend/reactivate and assign a tutor in one place. Student email is optional; matric number is required for login.
- Staff: create/edit instructors or interns, manage account status, and review staff clock-in/out records. Interns use the tutor portal with the same office and course boundaries.
- Courses: oversee courses and covers. Tutors build lessons and publish their courses.
- Finance: record company income manually. Every saved record is automatically visible in Super Admin Finance reports; confirmed records contribute to income totals. There is no payment gateway.
- Student attendance: read the course attendance recorded by tutors. Staff attendance approvals live under Staff.
- Announcements: target Students, Staff, or Students and Staff.
- Settings: profile picture, name, password, appearance choices and institution preferences. Admin's own attendance is accessed here.

## Tutor
- My Courses contains the create-course action. Courses start as drafts. Open a course to edit details, manage lessons and publish.
- Admin assigns students to a tutor. In each course, that tutor explicitly selects the students who need it; new courses are not automatically shared. Drafts remain hidden from students.
- Assignments & Projects shares creation, file/text submissions and grading. Choose the work type in the form. Graded work is shown to the student in their assignment and results views.
- Attendance is marked for students enrolled in the tutor's course and is reflected to Admin and the student. Tutors can only mark their own courses.
- Exams, quizzes, gradebook and schedules are removed from the MVP navigation. Legacy landing pages redirect to the current workflow; historical records are retained.

## Super Admin
- Network overview shows students, staff (including Admins and interns), intern subset, company income and the responsible Admin by branch/state.
- Admin Management creates and edits Admin accounts, records a branch state and provides suspension/reactivation, password reset and deletion controls.
- Staff & Interns lists the workforce across companies; Finance reports shows Admin-recorded income across companies.
- Staff attendance remains remotely reviewable. Super Admin does not clock in or out.
- Set the company state when creating/editing its Admin. Existing branches show “Not set” until supplied.

## Account and display behavior
All four roles have profile-photo upload and password updates inside Settings. Student settings retain their profile controls. Appearance (Light/Dark/System and compact sidebar) is saved and applied for all roles; Notifications has been removed from every Settings page. Profile-photo upload remains private, content-validated, limited to 3 MB, and rate limited. Super Admin photo/settings do not require an office assignment.

Line/area charts show monthly records; donut charts show composition using real totals. Zero totals have an empty state. Mobile menus and dialogs scroll within the available screen height.

The student self-clock migration described below is required and has been confirmed applied. Tutor enrollment uses existing protected record storage; staff classification and branch state are managed account metadata. Existing authentication, rate limits and 24-hour Remember me behavior remain in place.

Validation: TypeScript, ESLint, production build and 82 unit/integration tests, including enrollment boundaries, profile provisioning, staff announcements, cross-company finance authorization and intern totals. Browser visual QA was unavailable in this run.

## Course files and Free-plan boundaries
Admins open a course from Courses; Tutors open their course builder. Both can upload PDF, DOCX, PPTX, TXT, ZIP, MP4, WebM and MP3 files, separately from cover pictures. Limit: 3,000,000 bytes per file, 50 files / 150 MB per course, and a 500 MB shared allowance for course files. This leaves room within the Free plan's 1 GB file storage for other app files. Supabase's plan quotas remain authoritative; no paid service or automatic upgrade is enabled.

Uploads use private, path-scoped signed resumable grants. Uploaded size and file signatures are checked before a material becomes visible. Only selected/enrolled students can obtain short-lived download links. Pending transfers can be resumed or removed. Course creation offers “open created course” or “dashboard”.

## Shared money records and monthly reports
Finance shows each student's current fees, all paid receipts, remaining balance and credit to Admin (own company) and Super Admin (all companies). Super Admin can add a direct receipt but has no edit action for Admin receipts. Admin receipt records cannot be overwritten through the old edit action. Collector identity is retained if an Admin account is deleted.

Admin records expenses with amount, date, description and unique reference. Both oversight levels can choose a month, see receipts, expenses and income-minus-expenses, and download a CSV report suitable for Excel. Reports distinguish the selected month's movements from current all-time student balances. Monthly surplus excludes opening balances; no bank reconciliation or automatic detection of unrecorded cash is claimed.

## Attendance update
Migration `202611060005_student_self_clock.sql` allows active Students, Tutors and Admins to sign themselves in and out using PostgreSQL's clock. Super Admin remains excluded. Office policy schedules, idempotency, frozen rosters, revision checks, immutable audit events and the existing approval hierarchy remain enforced. Students cannot choose a date or time. User confirmed this migration was applied successfully.
