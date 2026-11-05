import type { ApprovalStatus } from "@/modules/admin/shared/types";

export interface AdmissionApplication {
  id: string;
  applicantName: string;
  email: string;
  program: string;
  session: string;
  submittedAt: string;
  status: ApprovalStatus;
}
