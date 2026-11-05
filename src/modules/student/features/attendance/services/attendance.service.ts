import "server-only";
import { listRecords } from "@/shared/data/records";
import type { SavedAttendance } from "@/modules/tutor/features/attendance/services/attendance.service";
import type { AttendanceOverview } from "../types";
export async function getAttendanceOverview(): Promise<AttendanceOverview> {
  const records = await listRecords<SavedAttendance>("attendance");
  const presentCount = records.filter((r) => r.mark === "present").length;
  const lateCount = records.filter((r) => r.mark === "late").length;
  return {
    records,
    summary: {
      totalSessions: records.length,
      presentCount,
      lateCount,
      absentCount: records.filter((r) => r.mark === "absent").length,
      presentPercent: records.length
        ? Math.round(((presentCount + lateCount) / records.length) * 100)
        : 0,
    },
  };
}
