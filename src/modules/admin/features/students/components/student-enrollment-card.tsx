import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/shared/components";
import { BookOpen } from "lucide-react";
import type { AdminStudentProfile } from "../types";

export function StudentEnrollmentCard({ profile }: { profile: AdminStudentProfile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Academic Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">GPA</p>
            <p className="text-lg font-semibold text-foreground">{profile.academicSummary.gpa.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Credits completed</p>
            <p className="text-lg font-semibold text-foreground">{profile.academicSummary.creditsCompleted}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Credits required</p>
            <p className="text-lg font-semibold text-foreground">{profile.academicSummary.creditsRequired}</p>
          </div>
        </div>

        {profile.enrollments.length === 0 ? (
          <EmptyState icon={BookOpen} title="No course enrollments recorded" />
        ) : (
          <div className="space-y-3">
            {profile.enrollments.map((enrollment) => (
              <div key={enrollment.courseCode} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {enrollment.courseCode} · {enrollment.courseTitle}
                  </span>
                  <span className="text-muted-foreground">Grade: {enrollment.grade}</span>
                </div>
                <Progress value={enrollment.progressPercent} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
