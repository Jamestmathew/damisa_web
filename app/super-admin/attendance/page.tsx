import { getDailyAttendance } from "@/shared/attendance/service";
import { DailyAttendanceManager } from "@/shared/attendance/manager";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ office?: string; date?: string }>;
}) {
  const params = await searchParams;
  const data = await getDailyAttendance(params.office, params.date);
  return (
    <DailyAttendanceManager
      key={`${data.officeId}:${data.date}`}
      data={data}
      staff
    />
  );
}
