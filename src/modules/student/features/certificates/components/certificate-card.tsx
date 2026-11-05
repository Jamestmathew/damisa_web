import { Award, Download } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Certificate } from "../types";

import { CertificatePreviewDialog } from "./certificate-preview-dialog";

export function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-secondary p-2">
            <Award className="size-4 text-secondary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {certificate.courseTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {certificate.courseCode} · Issued {certificate.issuedAt}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CertificatePreviewDialog certificate={certificate} />
          <Button variant="ghost" size="icon" asChild>
            <a
              href={`/student/certificates/${certificate.id}/download`}
              aria-label="Download certificate"
            >
              <Download className="size-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
