import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormStatusMessageProps {
  variant: "error" | "success";
  message: string;
}

/**
 * Single place that renders the top-level (non-field) success/error state
 * for a form's action result. Every auth form uses this instead of
 * hand-rolling its own alert markup.
 */
export function FormStatusMessage({ variant, message }: FormStatusMessageProps) {
  if (variant === "success") {
    return (
      <Alert variant="success" className="mb-4">
        <CheckCircle2 />
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
