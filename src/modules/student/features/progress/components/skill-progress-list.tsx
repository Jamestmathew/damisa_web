import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SkillProgressItem } from "../types";

export function SkillProgressList({ skills }: { skills: SkillProgressItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Skills</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {skills.map((skill) => (
          <div key={skill.skill} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{skill.skill}</span>
              <span className="text-muted-foreground">{skill.progressPercent}%</span>
            </div>
            <Progress value={skill.progressPercent} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
