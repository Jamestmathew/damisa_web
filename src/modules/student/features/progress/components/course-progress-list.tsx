import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CourseProgressItem } from "../types";

export function CourseProgressList({ courses }: { courses: CourseProgressItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Progress by Course</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.map((course) => (
          <div key={course.courseId} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{course.courseCode}</span>
              <span className="text-muted-foreground">
                {course.lessonsCompleted}/{course.lessonsTotal} lessons
              </span>
            </div>
            <Progress value={course.progressPercent} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
