import { Award } from "lucide-react";

import { EmptyState } from "@/modules/student/shared/components";
import type { Certificate } from "../types";

import { CertificateCard } from "./certificate-card";

export function CertificateList({ certificates }: { certificates: Certificate[] }) {
  if (certificates.length === 0) {
    return (
      <EmptyState
        icon={Award}
        title="No certificates yet"
        description="Complete a course to earn your first certificate."
      />
    );
  }

  return (
    <div className="space-y-3">
      {certificates.map((certificate) => (
        <CertificateCard key={certificate.id} certificate={certificate} />
      ))}
    </div>
  );
}
