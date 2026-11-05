import type { Metadata } from "next";

import { PageHeader } from "@/modules/student/shared/components";
import { getCertificates, CertificateList } from "@/modules/student/features/certificates";

export const metadata: Metadata = { title: "Certificates" };

export default async function CertificatesPage() {
  const certificates = await getCertificates();

  return (
    <div>
      <PageHeader title="Certificates" description="Credentials you've earned from completed courses" />
      <CertificateList certificates={certificates} />
    </div>
  );
}
