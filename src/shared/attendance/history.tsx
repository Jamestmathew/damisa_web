import { requireRole } from "@/shared/rbac";
import { StaffSelfClock } from "./self-clock";
import { getOwnDailyHistory } from "./service";
export async function OwnAttendanceHistory() {
  const user = await requireRole(["student", "tutor", "admin"]);
  const rows = await getOwnDailyHistory();
  const todayEntry = rows.find(
    (row) =>
      row.attendance_days.office_id === user.officeId &&
      row.attendance_days.attendance_date ===
        new Intl.DateTimeFormat("en-CA", {
          timeZone: row.attendance_days.policy_snapshot.timezone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date()),
  );
  return (
    <section className="space-y-4">
      {user.role !== "student" ? (
        <StaffSelfClock
          checkedIn={!!todayEntry?.check_in}
          checkedOut={!!todayEntry?.check_out}
        />
      ) : null}
      <h2 className="text-xl font-semibold">Daily arrival attendance</h2>
      <p className="text-sm text-muted-foreground">
        Your arrival and departure records. Excuses are shown separately from
        the calculated result.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {[
                "Date",
                "Arrival",
                "Departure",
                "Calculated result",
                "Late minutes",
                "Excuse",
                "Approval",
              ].map((title) => (
                <th className="p-2 text-left" key={title}>
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const fmt = (value: string | null) =>
                value
                  ? new Intl.DateTimeFormat("en-GB", {
                      timeZone: row.attendance_days.policy_snapshot.timezone,
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(value))
                  : "—";
              return (
                <tr key={row.id} className="border-t">
                  <td className="p-2">{row.attendance_days.attendance_date}</td>
                  <td className="p-2">{fmt(row.check_in)}</td>
                  <td className="p-2">{fmt(row.check_out)}</td>
                  <td className="p-2 capitalize">{row.calculated_status}</td>
                  <td className="p-2">{Math.ceil(row.late_seconds / 60)}</td>
                  <td className="p-2">
                    {row.excused ? row.excuse_reason : "—"}
                  </td>
                  <td className="p-2 capitalize">
                    {row.approval_status ?? "pending"}
                    {row.review_reason ? (
                      <p className="text-xs normal-case">{row.review_reason}</p>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!rows.length ? (
        <p className="text-sm text-muted-foreground">
          No daily attendance has been recorded yet.
        </p>
      ) : null}
    </section>
  );
}
