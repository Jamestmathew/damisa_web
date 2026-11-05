import { getDailyAttendance } from "@/shared/attendance/service";
import { DailyAttendanceManager } from "@/shared/attendance/manager";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  return (
    <DailyAttendanceManager
      data={await getDailyAttendance(undefined, params.date)}
      staff={false}
    />
  );
}
