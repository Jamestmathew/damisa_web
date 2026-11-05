import "server-only";
import { listRecords } from "@/shared/data/records";
import type { ActivityLogEntry } from "../types";
export async function getActivityLogs(): Promise<ActivityLogEntry[]> {
  return listRecords<ActivityLogEntry>("activity_log");
}
