import { Progress } from "@/components/ui/progress";

export function CourseProgressBar({ percent }: { percent: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{percent}%</span>
      </div>
      <Progress value={percent} />
    </div>
  );
}
