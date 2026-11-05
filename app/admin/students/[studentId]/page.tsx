import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/shared/components";
import {
  getStudentProfile,
  StudentProfileHeader,
  StudentEnrollmentCard,
  StudentPaymentHistoryCard,
} from "@/modules/admin/features/students";
import { getPayments } from "@/modules/admin/features/finance";

export const metadata: Metadata = { title: "Student Profile" };

interface StudentProfilePageProps {
  params: Promise<{ studentId: string }>;
}

export default async function StudentProfilePage({ params }: StudentProfilePageProps) {
  const { studentId } = await params;
  const profile = await getStudentProfile(studentId);

  if (!profile) notFound();

  const allPayments = await getPayments();
  const payments = allPayments.filter((p) => p.payerEmail.toLowerCase() === profile.email.toLowerCase());

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Student Profile" description="Complete profile, academic progress, and payment history" />
      <StudentProfileHeader student={profile} />
      <StudentEnrollmentCard profile={profile} />
      <StudentPaymentHistoryCard payments={payments} />
    </div>
  );
}
