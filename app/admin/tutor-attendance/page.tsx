import { getTutorAttendanceReview } from "@/shared/attendance/service";
import { AttendanceApprovalControls } from "@/shared/attendance/approval-controls";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const data = await getTutorAttendanceReview(params.date);
  const fmt = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat("en-GB", {
          timeZone: data.timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(new Date(value))
      : "—";
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Tutor attendance approvals</h1>
      <p className="text-sm text-muted-foreground">
        Review your office’s Tutor attendance. Approval does not change arrival
        times or lateness. Super Admin reviews your own attendance.
      </p>
      <form className="flex gap-3">
        <label>
          Date{" "}
          <input
            className="rounded border bg-background p-2"
            type="date"
            name="date"
            defaultValue={data.date}
          />
        </label>
        <button className="rounded border px-3" type="submit">
          View
        </button>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {[
                "Tutor",
                "Arrival",
                "Departure",
                "Calculated result",
                "Late minutes",
                "Approval",
              ].map((title) => (
                <th className="p-3 text-left" key={title}>
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.entries.map((entry) => (
              <tr className="border-t" key={entry.id}>
                <td className="p-3">{entry.subject_name}</td>
                <td className="p-3">{fmt(entry.check_in)}</td>
                <td className="p-3">{fmt(entry.check_out)}</td>
                <td className="p-3 capitalize">{entry.calculated_status}</td>
                <td className="p-3">{Math.ceil(entry.late_seconds / 60)}</td>
                <td className="p-3">
                  <AttendanceApprovalControls entry={entry} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!data.entries.length ? (
        <p>No Tutor attendance has been recorded for this date.</p>
      ) : null}
    </div>
  );
}
