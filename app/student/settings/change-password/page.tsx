import type { Metadata } from "next";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/modules/student/shared/components";
import { ChangePasswordForm } from "@/modules/auth";

export const metadata: Metadata = { title: "Change password" };

export default function StudentChangePasswordPage() {
  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Change password" description="Update the password used to sign in" />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">New password</CardTitle>
          <CardDescription>Choose a strong password you haven&apos;t used before.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
