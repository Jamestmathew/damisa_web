"use client";

import { Award } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Certificate } from "../types";

export function CertificatePreviewDialog({ certificate }: { certificate: Certificate }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Certificate of Completion</DialogTitle>
          <DialogDescription>{certificate.credentialId}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border p-8 text-center">
          <Award className="size-12 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">This certifies that you have successfully completed</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{certificate.courseTitle}</p>
            <p className="text-xs text-muted-foreground">{certificate.courseCode}</p>
          </div>
          <p className="text-xs text-muted-foreground">Issued {certificate.issuedAt}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
