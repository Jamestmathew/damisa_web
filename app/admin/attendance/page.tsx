import { getDailyAttendance } from "@/shared/attendance/service";
import { AttendanceApprovalControls } from "@/shared/attendance/approval-controls";
import { requireRole } from "@/shared/rbac";
import { listRecords } from "@/shared/data/records";
import { PageHeader } from "@/shared/components";
import { getOfficePeople } from "@/shared/data/people";
import type { SavedAttendance } from "@/modules/tutor/features/attendance/services/attendance.service";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const daily = await getDailyAttendance(undefined, params.date);
  const time = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat("en-GB", {
          timeZone: daily.policy?.timezone ?? "Africa/Lagos",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(new Date(value))
      : "—";
  await requireRole(["admin"]);
  const [records, people] = await Promise.all([
    listRecords<SavedAttendance>("attendance"),
    getOfficePeople(),
  ]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Student attendance"
        description="Student sign-in/out records and tutor-marked course attendance"
      />
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Daily student sign in / sign out
        </h2>
        <form className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            Date
            <input
              name="date"
              type="date"
              defaultValue={daily.date}
              className="block rounded-md border bg-background px-3 py-2"
            />
          </label>
          <button className="rounded-md border px-3 py-2 text-sm">
            View date
          </button>
        </form>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {["Student", "Sign in", "Sign out", "Result", "Approval"].map(
                  (h) => (
                    <th key={h} className="p-3 text-left">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {daily.entries.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-3">{e.subject_name}</td>
                  <td className="p-3">{time(e.check_in)}</td>
                  <td className="p-3">{time(e.check_out)}</td>
                  <td className="p-3 capitalize">{e.calculated_status}</td>
                  <td className="p-3">
                    <AttendanceApprovalControls entry={e} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!daily.entries.length && (
            <p className="p-4 text-sm text-muted-foreground">
              No sign-in records for this date yet.
            </p>
          )}
        </div>
      </section>
      <h2 className="text-lg font-semibold">
        Course attendance marked by tutors
      </h2>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {["Date", "Student", "Course", "Mark"].map((h) => (
                <th key={h} className="p-3 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...records]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-3">{r.date}</td>
                  <td className="p-3">
                    {people.find((p) => p.id === r.studentId)?.name ??
                      "Student"}
                  </td>
                  <td className="p-3">
                    {r.courseCode} · {r.courseTitle}
                  </td>
                  <td className="p-3 capitalize">{r.mark}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {!records.length && (
          <p className="p-6 text-sm text-muted-foreground">
            Tutors have not recorded student attendance yet.
          </p>
        )}
      </div>
    </div>
  );
}
