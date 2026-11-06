# SMI MVP workflows

## Admin
- Students: create, view, edit, suspend/reactivate and assign a tutor in one place. Student email is optional; matric number is required for login.
- Staff: create/edit instructors or interns, manage account status, and review staff clock-in/out records. Interns use the tutor portal with the same office and course boundaries.
- Courses: oversee courses and covers. Tutors build lessons and publish their courses.
- Finance: record company income manually. Every saved record is automatically visible in Super Admin Finance reports; confirmed records contribute to income totals. There is no payment gateway.
- Student attendance: read the course attendance recorded by tutors. Staff attendance approvals live under Staff.
- Announcements: target Students, Staff, or Students and Staff.
- Settings: profile picture, name, password, notification choices and institution preferences. Admin's own attendance is accessed here.

## Tutor
- My Courses contains the create-course action. Courses start as drafts. Open a course to edit details, manage lessons and publish.
- Admin's student-to-tutor assignment enrolls the student in that tutor's current and future published courses. Drafts remain hidden from students.
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
All four roles have profile-photo upload and password updates inside Settings. Student settings retain their profile, notification and appearance controls. Profile-photo upload remains private, content-validated, limited to 3 MB, and rate limited. Super Admin photo/settings do not require an office assignment.

Line/area charts show monthly records; donut charts show composition using real totals. Zero totals have an empty state. Mobile menus and dialogs scroll within the available screen height.

No new SQL migration is needed for this update. Tutor enrollment uses existing protected record storage; staff classification and branch state are managed account metadata. Existing authentication, rate limits and 24-hour Remember me behavior remain in place.

Validation: TypeScript, ESLint, production build and 63 unit/integration tests, including enrollment boundaries, profile provisioning, staff announcements, cross-company finance authorization and intern totals. Browser visual QA was unavailable in this run.
