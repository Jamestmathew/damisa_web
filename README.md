# SMI Learning Portal

A Next.js / React / Supabase portal with separate Student, Tutor, Admin, and Super Admin areas. The recovered source is from `Jamestmathew/damisa_web79`; the existing production URL is https://smiweb79.vercel.app.

## Run locally

Use Node.js 22.18 or newer (Node 22 LTS recommended).

```sh
npm ci
cp .env.example .env.local
# Fill in your project's values locally, then:
npm run check:env
npm run check:database
npm run dev
```

Existing secrets belong in `.env.local` or `.env`, which are ignored by Git. A restored `.env.local` takes precedence over `.env`. The `SUPABASE_SECRET_KEY` / legacy service-role key must never have a `NEXT_PUBLIC_` prefix.

Apply these SQL files in Supabase SQL Editor **in order**, once for each Supabase project:

1. `supabase/migrations/202610310001_foundation.sql`
2. `supabase/migrations/202610310002_session_revocation.sql`

They retain existing accounts/offices and any existing Auth provisioning trigger. They add durable, office-scoped feature records, server-only write access, audit logging, unique references, atomic rate limits, and session revocation. Browser clients may read only their own profile; feature data goes through guarded server services. Review existing custom database integrations before changing their permissions. Duplicate matric numbers, ignoring case, must be resolved before the unique index can be created.

The first Super Admin must already exist in Supabase Auth and have a corresponding active `profiles` row with `role = 'super_admin'`. There is no public account-registration flow. Disable public signups in Supabase Auth settings. Do not promote roles from untrusted user metadata in custom Auth triggers.

## Login and accounts

- **Students:** matric number and password. Student email login is rejected.
- **Tutors, Admins, Super Admins:** email address and password.
- Super Admin provisions Admin accounts and assigns offices. Admin provisions students/tutors within their own office.
- Students without email receive a unique internal Auth identifier; they still sign in with their matric number. Their password can be reset by their Admin.
- Active status is checked on every server-side authorization. Signed session boundaries expire after 24 hours, or 30 days when Remember Me is selected. Browser-session cookies are used when Remember Me is off.
- Password resets and account-status changes invalidate earlier application sessions through `session_version`. Password changes require the current password. Logout clears both Supabase and application cookies.
- All roles can change passwords at `/settings/change-password`; the Student settings page also has its existing password form.

## Teaching workflow

1. Admin creates departments and class sections. Schedule format: `Mon & Wed, 09:00-10:00 | Main Hall` (24-hour Lagos time).
2. Tutor creates courses, lessons, assignments, quizzes, and exam schedules.
3. Admin opens **Classes → enrollment icon** and assigns students and courses to a class.
4. Tutor publishes the course. Students see only published courses assigned to their classes.
5. Students read lessons, open HTTPS video/resource URLs, mark lessons complete, submit assignments, and take quizzes.
6. Tutor sees real submissions and can grade them, record attendance, and review the gradebook. Progress, grades, reports, and dashboards derive from stored records.

Assignment due times use Africa/Lagos (UTC+1). Quizzes use an authoritative server-side start/expiry time and one submitted attempt per student. Repeated submissions return the saved result. Completed quizzes do not expose answer keys to the browser. An expired attempt currently requires a support/database intervention; there is no tutor reset-attempt UI yet.

The Tutor gradebook supports entering and editing individual CA and scheduled-exam marks. The default final-course weighting is **CA 30% / Exam 70%**, configurable per course. Recorded CA marks are authoritative for the CA portion; until CAs are recorded, graded assignments and quizzes provide provisional CA results. Scores within each portion are normalized by their total maximum points. A course total remains provisional until both weighted portions are present. GPA uses a 5-point scale (70/60/50/45/40 thresholds) and course-credit weighting. Completion certificates reflect completion of all currently published lessons; they are not an accreditation or final academic qualification. PDF downloads use a built-in font with ASCII fallback.

## Company income records

Finance is a **manual company earnings ledger**, as requested. Admin enters company name, income date, description, amount in naira, and a unique reference. Contact email is optional. Select a student when recording a student payment: the same record contributes to that student’s paid balance and the company income exactly once. Set each student’s expected total fees separately; students see total fees, paid amounts, remaining balances, account credit, and PDF receipts. Records can be edited, and changes are audited. Office summaries include recorded income. Super Admin’s Students page shows students across companies/offices, classes, balances, attendance, and lesson completion. There is no checkout, payment gateway, or automatic bank verification. The legacy `payment` record kind and some internal function names remain for compatibility.

Admin CSV exports cover student enrollment, company income, and attendance. CSV cells protect against spreadsheet formula injection.

## AI / RAG

The Student AI Chat interface remains in place. RAG and the planned provider API integration are deferred. Chat, knowledge ingestion, and policy ingestion return explicit unconfigured states; no generated replies, fabricated citations, or simulated indexing are presented as real results. AI governance flags remain disabled until an actual backend is connected.

Notification preferences are saved per user. Scheduled notification delivery and an email provider are not implemented; Supabase Auth email delivery uses your Supabase SMTP configuration. No mail-delivery claims are made by the preference controls.

## Password recovery

Set `NEXT_PUBLIC_SITE_URL` to the origin serving this app. Add the production and local callback URLs to **Supabase Auth → URL Configuration → Redirect URLs**:

- `https://smiweb79.vercel.app/auth/callback`
- `http://localhost:3000/auth/callback`

The standard Supabase email link supports the same-browser PKCE callback. For a token-hash recovery template, use:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery"
  >Reset password</a
>
```

Recovery links create a separate signed ten-minute recovery cookie. A submitted query-string token alone cannot reset a password. Use a configured SMTP sender for real delivery. An administrator can reset accounts with no deliverable email.

## Deploy on the existing Vercel project

1. Apply all database migrations and run `npm run check:database`.
2. Keep the existing Supabase variables and `CRON_SECRET` in Vercel.
3. Add a cryptographically random `SESSION_SECRET` of at least 32 characters (`openssl rand -hex 32`). Keep the same value across instances of a deployment; rotating it signs users out.
4. Set `NEXT_PUBLIC_SITE_URL=https://smiweb79.vercel.app` in the Production environment. Configure each Preview origin separately for email redirects when testing recovery.
5. Use `npm run build` and deploy the reviewed source to the existing project. A Git push to an auto-deploying production branch may publish immediately.

No gateway/provider key is needed. Rate limits use atomic PostgreSQL counters across Vercel instances and fail closed if the database protection is unavailable. Auth routes have account and platform-address limits; authenticated mutations also have per-user limits. On Vercel the platform's overwritten forwarded-address header is used, and local development shares a local bucket. The maintenance job at `/cron/daily` removes expired counters and never reactivates accounts. `CRON_SECRET` must be configured for the job to run.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Unit/integration tests cover grading attacks, enrollment/office isolation, tutor ownership, private submissions, stale writes, session signatures/expiry/revocation versions, CSV exports, and certificate structure. Repository tests use a fake Supabase query adapter; they do not replace live role-by-role browser testing.

For an **isolated disposable PostgreSQL database only**, `tests/database-bootstrap.sql` supplies minimal Supabase Auth stubs. Apply all migrations, then run `tests/database.test.sql`. Never run the bootstrap file in your real Supabase project. The database test checks profile RLS, denied browser writes/RPC execution, audit entries, duplicate references, and rate-window behavior.

Source changes alone do not update the live Vercel deployment. Check the final handoff for which migrations, live tests, and deployment steps have actually completed.

## Daily arrival attendance

Apply `supabase/migrations/202610310003_daily_attendance.sql` after the two foundation/session migrations. Admin manages student daily attendance in their office; Super Admin manages Tutor/Admin attendance across offices and configures attendance policies. Super Admin is excluded from rosters. Students, Tutors and Admins see their own daily history. Course attendance remains separate.

Super Admin first saves an effective-dated office policy with timezone, student/staff start and grace times, closing time, weekdays and holiday overrides. Open each active day's roster to snapshot eligible people and policy. Newly activated or transferred accounts join the next roster; existing snapshots remain unchanged. Enter actual arrival/departure times, or use Arrived now. Unmarked entries stay pending until finalization after closing. Late minutes are rounded up from seconds after the grace boundary. Excuses retain the calculated result, and corrections require reasons with immutable before/after audit events. Tutors and Admins may clock their own arrivals/departures using database time only; they cannot choose a time, edit their attendance or grant themselves excuses. Super Admin retains correction and excuse controls. Attendance history survives Auth account deletion.

The daily cron catches up overdue **opened** rosters; it does not invent historical rosters or attendance for days nobody opened. The manual Finalize day action provides recovery without waiting for cron. Confirm Vercel cron operation and schedule before relying on automatic finalization. No QR, biometrics or hardware integration is included. Academic terms and historical enrollment are future work.

Run `tests/attendance-database.test.sql` after migrations in the disposable local database. This rolls back its fixtures and verifies role boundaries, Super Admin exclusion, lateness/grace, idempotency, stale updates, immutable corrections, excuses and finalization. Never run the test bootstrap in production.

## Staff self clock-in/out

Apply `supabase/migrations/202610310004_staff_self_clock.sql` after the daily attendance migration. Tutors and Admins use **My attendance → Clock in now / Clock out now**. No time, office or person identifier is accepted from the browser; the action binds the signed-in staff member, and PostgreSQL supplies the timestamp and calculates lateness. The first staff clock action automatically opens the current day's staff roster using the configured office policy. Super Admin does not need to be physically present. Active policy configuration is still required once per office.

Students and Super Admin cannot self-clock. Repeated clicks/retries preserve the original time. Staff cannot backdate, change attendance, or excuse themselves; only Super Admin can make audited staff corrections/excuses. Clock-in closes at the policy closing time or when the day is finalized; a checked-in member may still clock out that day after closing. Overnight departures are outside this MVP. Fully unattended days still require roster initialization to be counted absent; the cron only finalizes opened rosters. The self-clock records the staff member's assertion of arrival, not verified physical location.

`tests/staff-clock-database.test.sql` verifies database timestamps, role restrictions, automatic roster creation, immutable event audit, idempotency, blocked self-corrections and retained Super Admin oversight in the disposable database.

### Attendance approval hierarchy

Admin approves/rejects student attendance and Tutor attendance within their office. Tutor arrivals remain self-clocked using database time; student daily attendance remains entered by Admin. **Admin → Tutor approvals** shows only Tutors, while **Student attendance** includes student review controls. Super Admin approves/rejects Admin attendance in **Staff attendance**; Tutor decisions there show the Admin review status. Nobody can approve themselves.

Approval is separate from calculated presence/lateness and does not change recorded times. Rejection requires a reason. Any later arrival/departure/correction/excuse change resets approval to pending, preserving previous decisions in immutable audit events. Staff see approval status and review reasons in their own history. The fourth migration includes both self-clock and approval storage/functions; it must be applied after the first three migrations.
