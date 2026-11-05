import type { Metadata } from "next";
import { ShieldOff } from "lucide-react";

import { AuthCard, AuthHeader, AuthFooter } from "@/modules/auth";
import { AUTH_ROUTES } from "@/modules/auth/constants";

export const metadata: Metadata = { title: "Registration unavailable" };

/**
 * This LMS is institution-managed: Students, Tutors, and Admins do not
 * self-register. Only an Admin can create accounts (see the Admin Users
 * feature). This page intentionally has no form — it exists so a stray
 * link to /register still resolves to something helpful rather than 404.
 */
export default function RegisterPage() {
  return (
    <AuthCard>
      <AuthHeader title="Registration unavailable" />
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-10 text-center">
        <ShieldOff className="size-8 text-muted-foreground" />
        <p className="max-w-xs text-sm text-muted-foreground">
          This platform doesn&apos;t support public sign-up. Student, Tutor, and
          Admin accounts are created by your institution&apos;s administrator,
          who will issue your sign-in credentials.
        </p>
      </div>
      <AuthFooter
        prompt="Already have an account?"
        linkLabel="Sign in"
        href={AUTH_ROUTES.login}
      />
    </AuthCard>
  );
}
