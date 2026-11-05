"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-4 p-8">
      <h1 className="text-xl font-semibold">Unable to load this page</h1>
      <p className="text-sm text-muted-foreground">
        Check your connection and try again. If the problem continues, contact
        your administrator.
      </p>
      <Button onClick={reset}>Try again</Button>
      <Link href="/" className="ml-4 text-sm text-primary underline">
        Go to dashboard
      </Link>
    </div>
  );
}
