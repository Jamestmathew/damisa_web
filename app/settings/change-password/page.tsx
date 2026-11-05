import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/modules/auth/lib/route-guard";
import { ChangePasswordForm } from "@/modules/auth/components/forms/change-password-form";
import { ROLE_HOME_PATH } from "@/shared/rbac";
export const metadata: Metadata = { title: "Change password" };
export default async function ChangePasswordPage() {
  const user = await requireAuth();
  return (
    <main className="mx-auto max-w-md space-y-5 px-4 py-10">
      <Link
        className="text-sm text-primary underline"
        href={ROLE_HOME_PATH[user.role]}
      >
        Back to dashboard
      </Link>
      <h1 className="text-2xl font-semibold">Change password</h1>
      <ChangePasswordForm />
    </main>
  );
}
