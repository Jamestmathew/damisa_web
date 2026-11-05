"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { AuthProvider } from "@/modules/auth/types";
import { cn } from "@/lib/utils";

interface SocialLoginButtonProps {
  provider: AuthProvider;
  icon: ReactNode;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const PROVIDER_LABEL: Record<AuthProvider, string> = {
  google: "Continue with Google",
  github: "Continue with GitHub",
  microsoft: "Continue with Microsoft",
};

/**
 * No provider is wired up yet — this is intentionally inert until an
 * OAuth integration is added. Pass `onClick` to hook it up later; until
 * then it renders disabled so it's visibly a placeholder, not a dead end.
 */
export function SocialLoginButton({
  provider,
  icon,
  label,
  onClick,
  disabled = true,
  className,
}: SocialLoginButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={cn("w-full", className)}
      aria-label={label ?? PROVIDER_LABEL[provider]}
    >
      {icon}
      {label ?? PROVIDER_LABEL[provider]}
    </Button>
  );
}
