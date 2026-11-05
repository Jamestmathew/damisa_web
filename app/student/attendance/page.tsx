import { OwnAttendanceHistory } from "@/shared/attendance/history";
import type { Metadata } from "next";

import { PageHeader } from "@/modules/student/shared/components";
import {
  getAttendanceOverview,
  AttendanceSummaryCard,
  AttendanceTable,
} from "@/modules/student/features/attendance";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Attendance" };

export default async function AttendancePage() {
  const { summary, records } = await getAttendanceOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Your daily arrivals and course attendance"
      />
      <OwnAttendanceHistory />
      <h2 className="text-xl font-semibold">Course attendance</h2>

      <div className="max-w-sm">
        <AttendanceSummaryCard summary={summary} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Records</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceTable records={records} />
        </CardContent>
      </Card>
    </div>
  );
}
