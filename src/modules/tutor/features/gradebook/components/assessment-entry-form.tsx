"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { saveAssessmentGradeAction } from "../actions/save-assessment-grade.action";
import { saveGradePolicyAction } from "../actions/save-grade-policy.action";
import {
  DEFAULT_ASSESSMENT_POLICY,
  type AssessmentMark,
  type AssessmentPolicy,
} from "@/shared/academic/grading";
interface CourseOption {
  id: string;
  title: string;
  code: string;
  assessmentPolicy?: AssessmentPolicy;
}
interface StudentOption {
  id: string;
  name: string;
  courseId: string;
}
interface ExamOption {
  id: string;
  courseId: string;
  title: string;
}
function ExistingMark({
  mark,
  student,
  course,
}: {
  mark: AssessmentMark;
  student: string;
  course: string;
}) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="space-y-2 rounded-lg border p-3"
      action={(data) =>
        startTransition(async () => {
          try {
            const result = await saveAssessmentGradeAction(data);
            setMessage(result.ok ? "Grade updated." : result.error);
          } catch {
            setMessage("Unable to update this grade.");
          }
        })
      }
    >
      <p className="font-medium">
        {student} · {course}
      </p>
      <p className="text-sm">
        {mark.category === "ca" ? "CA" : "Exam"}: {mark.title}
      </p>
      {Object.entries({
        id: mark.id,
        studentId: mark.studentId,
        courseId: mark.courseId,
        category: mark.category,
        assessmentId: mark.assessmentId ?? "",
        title: mark.title,
      }).map(([name, value]) => (
        <input type="hidden" key={name} name={name} value={value} />
      ))}
      <div className="flex items-end gap-3">
        <label className="text-xs">
          Score
          <Input
            type="number"
            name="score"
            min="0"
            step="0.01"
            defaultValue={mark.score}
            required
          />
        </label>
        <label className="text-xs">
          Out of
          <Input
            type="number"
            name="maxScore"
            min="1"
            max="1000"
            step="0.01"
            defaultValue={mark.maxScore}
            required
          />
        </label>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Update mark"}
        </Button>
      </div>
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
    </form>
  );
}
export function AssessmentEntryForm({
  courses,
  students,
  exams,
  marks,
}: {
  courses: CourseOption[];
  students: StudentOption[];
  exams: ExamOption[];
  marks: AssessmentMark[];
}) {
  const [courseId, setCourseId] = useState(courses[0]?.id ?? ""),
    [category, setCategory] = useState<"ca" | "exam">("ca"),
    [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const course = courses.find((c) => c.id === courseId);
  const policy = course?.assessmentPolicy ?? DEFAULT_ASSESSMENT_POLICY;
  const roster = students.filter((s) => s.courseId === courseId),
    scheduled = exams.filter((e) => e.courseId === courseId);
  return (
    <div className="mb-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">CA and exam marks</CardTitle>
          <CardDescription>
            Enter or update each assessment for students enrolled in your
            course. Recorded CA marks determine the CA portion; assignments and
            quizzes provide provisional CA results until then.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block text-sm">
            Course
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="mt-1 h-10 w-full rounded-md border bg-background px-3"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} · {c.title}
                </option>
              ))}
            </select>
          </label>
          <p className="text-sm font-medium">
            CA {policy.caWeight}% / Exam {policy.examWeight}%
          </p>
          <form
            key={`${courseId}:${category}:${policy.caWeight}`}
            className="space-y-3"
            action={(data) =>
              startTransition(async () => {
                setMessage("");
                try {
                  const result = await saveAssessmentGradeAction(data);
                  setMessage(
                    result.ok ? "Assessment grade saved." : result.error,
                  );
                } catch {
                  setMessage("Unable to save this grade.");
                }
              })
            }
          >
            <input type="hidden" name="courseId" value={courseId} />
            <label className="block text-sm">
              Student
              <select
                name="studentId"
                required
                className="mt-1 h-10 w-full rounded-md border bg-background px-3"
              >
                {roster.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Assessment type
              <select
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as "ca" | "exam")}
                className="mt-1 h-10 w-full rounded-md border bg-background px-3"
              >
                <option value="ca">CA</option>
                <option value="exam">Exam</option>
              </select>
            </label>
            {category === "ca" ? (
              <label className="block text-sm">
                CA name
                <Input
                  name="title"
                  placeholder="e.g. CA test 1"
                  required
                  maxLength={200}
                />
              </label>
            ) : (
              <>
                <input type="hidden" name="title" value="Exam" />
                <label className="block text-sm">
                  Exam
                  <select
                    name="assessmentId"
                    required
                    className="mt-1 h-10 w-full rounded-md border bg-background px-3"
                  >
                    {scheduled.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    ))}
                  </select>
                </label>
                {!scheduled.length && (
                  <p className="text-sm">
                    Schedule this course’s exam under Exams first.
                  </p>
                )}
              </>
            )}
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                Score
                <Input
                  name="score"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                />
              </label>
              <label className="block text-sm">
                Maximum score
                <Input
                  name="maxScore"
                  type="number"
                  min="1"
                  max="1000"
                  step="0.01"
                  defaultValue={
                    (category === "ca" ? policy.caWeight : policy.examWeight) ||
                    100
                  }
                  required
                />
              </label>
            </div>
            <Button
              type="submit"
              disabled={
                pending ||
                !roster.length ||
                (category === "exam" && !scheduled.length)
              }
            >
              {pending ? "Saving..." : "Save assessment grade"}
            </Button>
            {!roster.length && (
              <p className="text-sm">
                Admin must enroll students in this course’s class first.
              </p>
            )}
          </form>
          {message && (
            <p role="status" className="text-sm">
              {message}
            </p>
          )}
          <details className="rounded border p-3">
            <summary className="cursor-pointer text-sm">
              Course grading weights
            </summary>
            <form
              className="mt-3 flex items-end gap-3"
              action={(data) =>
                startTransition(async () => {
                  try {
                    const result = await saveGradePolicyAction(data);
                    setMessage(
                      result.ok ? "Grading weights updated." : result.error,
                    );
                  } catch {
                    setMessage("Unable to save weights.");
                  }
                })
              }
            >
              <input type="hidden" name="courseId" value={courseId} />
              <label className="text-sm">
                CA percentage
                <Input
                  name="caWeight"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={policy.caWeight}
                  key={courseId + policy.caWeight}
                />
              </label>
              <Button type="submit" disabled={pending || !courseId}>
                Save weights
              </Button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              Exam percentage is 100 minus CA percentage.
            </p>
          </details>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {marks
          .filter((m) => m.courseId === courseId)
          .map((mark) => (
            <ExistingMark
              key={mark.id}
              mark={mark}
              student={
                students.find((s) => s.id === mark.studentId)?.name ?? "Student"
              }
              course={course?.code ?? ""}
            />
          ))}
      </div>
    </div>
  );
}
