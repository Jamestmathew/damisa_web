import { Separator } from "@/components/ui/separator";

interface AuthDividerProps {
  label?: string;
}

export function AuthDivider({ label = "Or continue with" }: AuthDividerProps) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <Separator />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
