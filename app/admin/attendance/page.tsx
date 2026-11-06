import { requireRole } from "@/shared/rbac";
import { listRecords } from "@/shared/data/records";
import { PageHeader } from "@/shared/components";
import { getOfficePeople } from "@/shared/data/people";
import type { SavedAttendance } from "@/modules/tutor/features/attendance/services/attendance.service";
export default async function Page() {
  await requireRole(["admin"]);
  const [records, people] = await Promise.all([
    listRecords<SavedAttendance>("attendance"),
    getOfficePeople(),
  ]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Student attendance"
        description="Attendance marked by tutors, reflected here for your office"
      />
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
