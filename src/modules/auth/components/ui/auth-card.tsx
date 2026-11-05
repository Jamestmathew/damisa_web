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
    <Card className={cn("w-full max-w-md shadow-md", className)}>
      <CardContent className="p-6 sm:p-8">{children}</CardContent>
    </Card>
  );
}
