"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { AUTH_ROUTES } from "@/modules/auth/constants";
import { verifyEmailAction } from "@/modules/auth/actions/verify-email.action";
import type { AuthActionState } from "@/modules/auth/types";
import { Button } from "@/components/ui/button";
import { FormStatusMessage } from "@/modules/auth/components/ui";

interface VerifyEmailStatusProps {
  token: string;
}

export function VerifyEmailStatus({ token }: VerifyEmailStatusProps) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<AuthActionState>(null);

  useEffect(() => {
    if (!token) return;
    startTransition(async () => {
      const result = await verifyEmailAction(token);
      setState(result);
    });
  }, [token]);

  if (!token) {
    return (
      <FormStatusMessage
        variant="error"
        message="This verification link is missing a token."
      />
    );
  }

  if (isPending || state === null) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
        Verifying your email...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FormStatusMessage
        variant={state.ok ? "success" : "error"}
        message={
          state.ok
            ? (state.message ?? "Your email has been verified.")
            : state.error
        }
      />
      <Button asChild className="w-full">
        <Link href={AUTH_ROUTES.login}>Go to sign in</Link>
      </Button>
    </div>
  );
}
