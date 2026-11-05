import "server-only";
import { listRecords, saveRecord } from "@/shared/data/records";
import type { SystemSettings } from "../types";
export async function getSystemSettings(): Promise<SystemSettings> {
  return (
    (await listRecords<SystemSettings>("system_settings"))[0] ?? {
      institutionName: "Your institution",
      academicSession: "",
      supportEmail: "",
      allowManualPaymentRecording: true,
    }
  );
}
export async function updateSystemSettings(input: SystemSettings) {
  const existing = (await listRecords("system_settings"))[0];
  await saveRecord("system_settings", input, existing?.id);
  return { ok: true as const, settings: input };
}
