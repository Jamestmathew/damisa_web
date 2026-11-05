import { listRecords, commitCollection } from "@/shared/data/collections";
import "server-only";

import type { AdmissionApplication } from "../types";

export async function getAdmissionApplications(): Promise<
  AdmissionApplication[]
> {
  const applications: AdmissionApplication[] =
    await listRecords<AdmissionApplication>("admission");

  return [...applications];
}

export async function setAdmissionStatus(
  id: string,
  status: AdmissionApplication["status"],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const applications: AdmissionApplication[] =
    await listRecords<AdmissionApplication>("admission");
  const before = structuredClone(applications);
  const result = await (async (): Promise<
    { ok: true } | { ok: false; error: string }
  > => {
    const application = applications.find((a) => a.id === id);

    if (!application) return { ok: false, error: "Application not found." };

    application.status = status;
    return { ok: true };
  })();
  if (result.ok) await commitCollection("admission", before, applications);
  return result;
}
