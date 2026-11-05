import { cookies } from "next/headers";
import { RECOVERY_COOKIE } from "@/shared/security/policy";
import type { Metadata } from "next";

import { AuthCard, AuthHeader, ResetPasswordForm } from "@/modules/auth";

export const metadata: Metadata = { title: "Reset password" };

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  await searchParams;
  const token = (await cookies()).get(RECOVERY_COOKIE)
    ? "recovery-session"
    : "";

  return (
    <AuthCard>
      <AuthHeader
        title="Reset your password"
        description="Choose a new password for your account"
      />
      <ResetPasswordForm token={token ?? ""} />
    </AuthCard>
  );
}
