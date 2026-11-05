import { BrandLogo } from "@/shared/brand/logo";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Shared visual shell for every auth screen (login, register, forgot
 * password, etc.) so they all look consistent without re-declaring the
 * same card/spacing markup in each form.
 */
export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <Card
      className={cn(
        "auth-brand-card w-full max-w-md rounded-2xl shadow-2xl",
        className,
      )}
    >
      <CardContent className="p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-3">
          <BrandLogo size={88} />
          <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            School of Management
            <br />
            and Innovation
          </p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
