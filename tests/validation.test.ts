import test from "node:test";
import assert from "node:assert/strict";
import { loginSchema } from "../src/modules/auth/validation/login.schema.ts";
import { assignmentSubmissionSchema } from "../src/modules/student/features/assignments/validation/submission.schema.ts";
import {
  notificationPreferencesSchema,
  profilePreferencesSchema,
} from "../src/modules/student/features/settings/validation/preferences.schema.ts";
import { quizFormSchema } from "../src/modules/tutor/features/quizzes/validation/quiz-form.schema.ts";
test("updated form validator preserves login and preference defaults", () => {
  assert.equal(
    loginSchema.parse({ identifier: "QA/001", password: "example" }).rememberMe,
    false,
  );
  assert.equal(
    profilePreferencesSchema.parse({ displayName: "Example student" }).bio,
    "",
  );
  assert.equal(
    notificationPreferencesSchema.parse({}).assignmentReminders,
    true,
  );
  assert.equal(
    loginSchema.safeParse({ identifier: "", password: "" }).success,
    false,
  );
});
test("assignment validation accepts file-only submissions and rejects empty or excess files", () => {
  const submission = {
    assignmentId: "assignment-one",
    submissionText: "",
    attachmentCount: 1,
  };
  assert.equal(assignmentSubmissionSchema.safeParse(submission).success, true);
  assert.equal(
    assignmentSubmissionSchema.safeParse({ ...submission, attachmentCount: 0 })
      .success,
    false,
  );
  assert.equal(
    assignmentSubmissionSchema.safeParse({ ...submission, attachmentCount: 6 })
      .success,
    false,
  );
});
test("numeric form coercion and quiz answer bounds survive the validator upgrade", () => {
  const base = {
    courseId: "course-one",
    title: "Example quiz",
    durationMinutes: "15",
    questions: [
      {
        prompt: "Choose an answer",
        options: ["First", "Second"],
        correctOptionIndex: "1",
      },
    ],
  };
  const result = quizFormSchema.safeParse(base);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.durationMinutes, 15);
    const firstQuestion = result.data.questions[0];
    assert.ok(firstQuestion);
    assert.equal(firstQuestion.correctOptionIndex, 1);
  }
  assert.equal(
    quizFormSchema.safeParse({ ...base, durationMinutes: "invalid" }).success,
    false,
  );
});
