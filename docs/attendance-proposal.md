# Damisa attendance proposal — review before implementation

## A. Current architecture

Damisa uses Next.js server actions, Supabase Auth/PostgreSQL/private Storage and four roles: student, tutor, admin, super_admin. Offices represent tenant/company boundaries. Profiles identify people; class records link students and courses; course ownership identifies tutors. Server guards and office-scoped data access enforce access. Attendance currently stores a tutor-selected course/day mark, with no arrival facts, staff roster or configurable policy. Unmarked roster entries currently default to absent. Academic session is a settings string; structured terms and historical enrollment dates are missing. Generic activity logs identify actor/action/record, but do not retain attendance before/after values. The daily cron only cleans rate-limit entries.

## B. Recommended architecture

Preserve existing course attendance as course attendance. Add daily office attendance using shared policy, roster, event and correction concepts, with separate student and staff views. Do not reinterpret legacy marks as arrival events or invent historical times. Attendance subjects are Students, Tutors and Admins. Super Admin is never an attendance subject.

Each office has effective-dated student and staff schedules, timezone, start time, grace period, closing time, active weekdays and holiday/date overrides. Admins use staff rules. Each daily roster snapshots eligibility and policy so later transfers or policy edits do not rewrite history. An unmarked entry remains pending until attendance closes.

## C. Workflows

1. On-time arrival: the authorized recorder captures actual arrival time. The server records submission time and actor separately, validates the office and roster, snapshots the applicable policy and calculates present.
2. Late arrival: preserve actual arrival and calculate late after the grace boundary. Start 08:00, grace 10 minutes, arrival 08:32 means 22 minutes late. Preserve seconds internally and document minute rounding.
3. No arrival: after the configured closing time, an authorized, idempotent finalization creates absence for eligible unmarked people. A catch-up job handles missed runs; an explicit close-day action provides recovery. No midnight assumptions.
4. Late Tutor/Admin: Super Admin records/manages staff attendance; staff start/grace rules apply regardless of role.
5. Correction: require a reason and append old/new values, actor and server time. Preserve original events and calculated status. Corrected factual time triggers a new calculation without erasing history.
6. Approved excuse: retain the original calculated late/absent result and show a separate excused decision, reason and approving actor.

## D. Permissions

| Action                                       | Student | Tutor | Admin                       | Super Admin                         |
| -------------------------------------------- | ------- | ----- | --------------------------- | ----------------------------------- |
| View own attendance                          | Yes     | Yes   | Yes                         | Not a subject                       |
| View/manage student daily attendance         | No      | No    | Own office                  | No routine access                   |
| View/manage Tutor and Admin daily attendance | No      | No    | No                          | All offices, explicit office filter |
| Correct/excuse student attendance            | No      | No    | Own office, reason required | No routine access                   |
| Correct/excuse staff attendance              | No      | No    | No                          | Reason required                     |
| Configure office policy/calendar             | No      | No    | No                          | Yes                                 |

This follows the latest requested split: Admin sees students; Super Admin sees staff (Tutor and Admin). Existing tutor course-attendance marking remains a separate teaching workflow pending review. Nobody can record/correct their own daily attendance. Extend the existing permission map and server guards rather than creating another authorization system. Tenant-scoped queries and RPC checks remain mandatory, including Super Admin actions selecting an office.

## E. Proposed database design — no migration yet

- attendance_policy_versions: office, effective dates, timezone, student/staff arrival and grace, closing time, weekdays, version, author.
- attendance_calendar_days: office, date, active/holiday override and reason.
- attendance_days: office, date, policy snapshot, open/finalized status, finalized actor/time; unique office/date.
- attendance_entries: day, subject identifier and role/name snapshot, eligible class snapshot, scope daily, effective check-in/out, calculated status, late seconds, effective excuse state, revision; unique day/subject/scope.
- attendance_events: entry, immutable arrival/departure event, occurred_at, recorded_at, recorder, source manual initially, idempotency key.
- attendance_corrections: entry/event, old and new facts/decisions, reason, actor, timestamp; append only.

Use typed relational tables and transaction-backed service-only RPCs for append/correct/finalize. Browser clients cannot write these tables. Keep attendance history when an Auth account is deleted by using retained/pseudonymous subject snapshots rather than cascading fact deletion. Define retention before release. Existing lms_records course marks remain readable.

## F. Edge cases

Unique keys and idempotency tokens prevent duplicate arrivals/retries. Transactions and revision checks prevent simultaneous recorders overwriting each other. Effective policy snapshots prevent retroactive schedule changes. Snapshot rosters preserve class transfers and deactivation history; a person is expected only during eligible dates. Weekends/holidays produce no automatic absence. Office timezone determines the attendance date; UTC stores instants. Reject future check-ins and invalid departure ordering; backdated manual arrivals require a reason and retain server receipt time. Network failures show an unsaved state and allow safe retry; no silent offline success. Staff-specific schedules can follow later using effective-dated assignments. Decide overnight-shift handling before enabling such schedules.

## G. MVP

Must have: configurable office calendar/student-staff policy; Admin student batch screen; Super Admin staff batch screen; personal history; arrival/departure capture; calculated lateness; pending versus finalized absence; audited corrections/excuses; tenant isolation; daily/individual reports with explicit attendance-percentage denominator; safe retries and finalization recovery.
Later: structured terms, historical enrollment/schedule assignments, CSV exports, trends, notifications and approved imports. Hardware later: QR, cards, RFID/NFC, biometrics and device APIs. Reserve source/idempotency fields now; do not implement hardware in this phase.

## H. Risks and release checks

A manually entered arrival is a recorder's assertion, not independently verified presence. Staff oversight depends on Super Admin availability. Prevent self-marking and retain correction history. Current generic audit logging and mutable JSON records alone are insufficient for attendance facts. Never mix course attendance percentages with office-arrival percentages. Confirm cron availability/cadence before automatic finalization, and retain manual catch-up. Batch indexed office/date reads to avoid per-person calls. Test cross-office access, Admin staff-data denial, Super Admin subject exclusion, grace boundaries, policy changes, concurrency, missed-job recovery and account deletion retention before release.

Implementation awaits review of this proposal, as requested in the supplied attendance brief. No attendance migration or permission change has been made for this proposal.

## Approved workflow revisions

The user subsequently approved Tutor/Admin self clock-in/out with database time only, no backdating or self-editing. Admin reviews Student and Tutor attendance; Super Admin reviews Admin attendance. Student daily records remain entered by Admin. Super Admin retains staff correction/exception controls and staff reporting, and is never an attendance subject. The fourth migration implements these revisions, with approval separate from attendance facts.
