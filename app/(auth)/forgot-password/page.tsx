import type { Metadata } from "next";

import { AuthCard, AuthHeader, AuthFooter, ForgotPasswordForm } from "@/modules/auth";
import { AUTH_ROUTES } from "@/modules/auth/constants";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard>
      <AuthHeader
        title="Forgot your password?"
        description="Enter your email and we'll send you a reset link"
      />

      <ForgotPasswordForm />

      <AuthFooter prompt="Remembered it?" linkLabel="Back to sign in" href={AUTH_ROUTES.login} />
    </AuthCard>
  );
}
