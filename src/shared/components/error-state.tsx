import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  message?: string;
}

export function ErrorState({ message = "Something went wrong while loading this data." }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 py-12 text-center">
      <AlertTriangle className="size-8 text-destructive" />
      <p className="text-sm font-medium text-destructive">{message}</p>
    </div>
  );
}
