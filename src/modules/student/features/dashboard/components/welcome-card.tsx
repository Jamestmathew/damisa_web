import { Card, CardContent } from "@/components/ui/card";

interface WelcomeCardProps {
  firstName: string;
}

export function WelcomeCard({ firstName }: WelcomeCardProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <Card className="bg-primary text-primary-foreground">
      <CardContent className="p-6">
        <p className="text-lg font-semibold">
          {greeting}, {firstName} 👋
        </p>
        <p className="mt-1 text-sm text-primary-foreground/80">
          Here&apos;s what&apos;s happening with your courses today.
        </p>
      </CardContent>
    </Card>
  );
}
