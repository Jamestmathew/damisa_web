import type { Metadata } from "next";

import { AuthCard, AuthHeader, LoginForm } from "@/modules/auth";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthCard>
      <AuthHeader
        title="Welcome back"
        description="Sign in with the credentials issued by your institution"
      />

      <LoginForm />

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Accounts are created by your institution&apos;s administrator. Contact
        your admin if you need access or have lost your credentials.
      </p>
    </AuthCard>
  );
}
