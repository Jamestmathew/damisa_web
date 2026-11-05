import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";

interface AssignmentFeedbackProps {
  score: number;
  maxScore: number;
  feedback: string | null;
}

export function AssignmentFeedback({ score, maxScore, feedback }: AssignmentFeedbackProps) {
  return (
    <Card className="border-success/30 bg-success/5">
      <CardContent className="flex items-start gap-3 p-4">
        <Award className="mt-0.5 size-5 shrink-0 text-success" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Score: {score}/{maxScore}
          </p>
          {feedback ? <p className="mt-1 text-sm text-muted-foreground">{feedback}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
