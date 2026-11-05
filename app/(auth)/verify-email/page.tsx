import type { Metadata } from "next";

import { AuthCard, AuthHeader, VerifyEmailStatus } from "@/modules/auth";

export const metadata: Metadata = { title: "Verify email" };

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams;

  return (
    <AuthCard>
      <AuthHeader title="Verify your email" description="Confirming your email address" />
      <VerifyEmailStatus token={token ?? ""} />
    </AuthCard>
  );
}
