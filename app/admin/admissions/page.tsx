import type { Metadata } from "next";

import { PageHeader } from "@/shared/components";
import { getAdmissionApplications, AdmissionsManager } from "@/modules/admin/features/admissions";

export const metadata: Metadata = { title: "Admissions" };

export default async function AdmissionsPage() {
  const applications = await getAdmissionApplications();

  return (
    <div>
      <PageHeader title="Admissions" description="Review and decide on incoming applications" />
      <AdmissionsManager applications={applications} />
    </div>
  );
}
