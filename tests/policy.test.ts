import { calculateResult } from "../src/shared/academic/grading.ts";
import {
  submissionFileType,
  MAX_SUBMISSION_BYTES,
} from "../src/shared/files/assignment-files.ts";
import {
  imageType,
  MAX_IMAGE_BYTES,
} from "../src/shared/media/image-policy.ts";
import { studentBalance } from "../src/shared/data/balance.ts";
import test from "node:test";
import assert from "node:assert/strict";
import {
  gradeAnswers,
  isMatricIdentifier,
  normalizeDeadline,
  safeLocalPath,
  parseClassSchedule,
} from "../src/shared/security/policy.ts";
import { toCsv } from "../src/shared/data/csv.ts";
import { certificatePdf } from "../src/shared/data/certificate-pdf.ts";
const questions = [
  { id: "q1", options: ["wrong", "correct"], correctOptionIndex: 1 },
  { id: "q2", options: ["correct", "wrong"], correctOptionIndex: 0 },
];
test("quiz grading uses each question's key", () => {
  assert.deepEqual(gradeAnswers(questions, { q1: "1", q2: "0" }), {
    correctCount: 2,
    totalCount: 2,
    scorePercent: 100,
  });
  assert.equal(gradeAnswers(questions, { q1: "0", q2: "1" }).scorePercent, 0);
});
test("extra or missing question ids cannot inflate scores", () => {
  assert.throws(() =>
    gradeAnswers(questions, { q1: "1", q2: "0", injected: "1" }),
  );
  assert.throws(() => gradeAnswers(questions, { q1: "1" }));
  assert.throws(() => gradeAnswers(questions, { q1: "1", injected: "0" }));
});
test("invalid answer indices and empty quizzes are rejected", () => {
  for (const value of ["-1", "2", "1.0", "Infinity", "", "01x"])
    assert.throws(() => gradeAnswers(questions, { q1: value, q2: "0" }));
  assert.throws(() => gradeAnswers([], {}));
});
test("redirects stay on this origin", () => {
  assert.equal(safeLocalPath("/student/courses", "/"), "/student/courses");
  for (const value of [
    "//evil.example",
    "https://evil.example",
    "/\\evil.example",
    "/\r\nevil",
    null,
  ])
    assert.equal(safeLocalPath(value, "/"), "/");
});
test("class schedules accept weekdays and ordered 24-hour times", () => {
  assert.deepEqual(parseClassSchedule("Mon & Wed, 09:00-10:30 | Main Hall"), {
    days: ["Mon", "Wed"],
    startTime: "09:00",
    endTime: "10:30",
    venue: "Main Hall",
  });
  for (const value of [
    "Mon 10:00-09:00",
    "Sat 10:00-11:00",
    "Mon 25:00-26:00",
    "Mon 09:99-10:00",
  ])
    assert.equal(parseClassSchedule(value), null);
});
test("CSV escapes formulas, quotes, and embedded line breaks", () => {
  const csv = toCsv([{ name: '=HYPERLINK("x")', body: 'one\n"two"' }]);
  assert.ok(csv.includes("'=HYPERLINK"));
  assert.ok(csv.includes('"one\n""two"""'));
  assert.ok(csv.startsWith("\uFEFF"));
});
test("certificate PDF escapes PDF operators and has valid object offsets", () => {
  const pdf = Buffer.from(
    certificatePdf("Student (test)", "Course", "CERT-123", "2026-10-31"),
  ).toString();
  assert.ok(pdf.startsWith("%PDF-1.4"));
  assert.ok(pdf.includes("Student \\(test\\)"));
  const offset = Number(pdf.match(/startxref\n(\d+)/)?.[1]);
  assert.equal(pdf.slice(offset, offset + 4), "xref");
});

test("matric identifiers reject wildcard searches", () => {
  assert.equal(isMatricIdentifier("CSC/2023/001"), true);
  assert.equal(isMatricIdentifier("CSC_001"), true);
  for (const value of ["*", "CSC%", "CSC\\001", "student@example.com", ""])
    assert.equal(isMatricIdentifier(value), false);
});
test("local deadlines use Lagos time", () => {
  assert.equal(
    normalizeDeadline("2026-10-31T12:30"),
    "2026-10-31T11:30:00.000Z",
  );
  assert.equal(
    normalizeDeadline("2026-10-31T12:30:00.000Z"),
    "2026-10-31T12:30:00.000Z",
  );
  assert.throws(() => normalizeDeadline("tomorrow"));
});

test("manual installments reduce balances once and pending records do not count", () => {
  assert.deepEqual(
    studentBalance(
      { studentId: "s", totalDueNaira: 100000, description: "Tuition" },
      [
        { amountNaira: 25000, status: "paid" },
        { amountNaira: 10000, status: "paid" },
        { amountNaira: 5000, status: "pending" },
      ],
    ),
    {
      totalDueNaira: 100000,
      paidNaira: 35000,
      remainingNaira: 65000,
      creditNaira: 0,
    },
  );
});
test("unconfigured fees differ from paid-in-full and overpayments become credit", () => {
  assert.equal(studentBalance(undefined, []).remainingNaira, null);
  assert.equal(
    studentBalance(
      { studentId: "s", totalDueNaira: 100, description: "Fees" },
      [{ amountNaira: 125, status: "paid" }],
    ).creditNaira,
    25,
  );
  assert.equal(
    studentBalance(
      { studentId: "s", totalDueNaira: 0.3, description: "Fees" },
      [
        { amountNaira: 0.1, status: "paid" },
        { amountNaira: 0.2, status: "paid" },
      ],
    ).remainingNaira,
    0,
  );
});

test("uploads accept supported image signatures and reject SVG and oversized files", () => {
  assert.equal(
    imageType(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])).mime,
    "image/png",
  );
  assert.equal(imageType(new Uint8Array([255, 216, 255])).mime, "image/jpeg");
  assert.throws(() =>
    imageType(new TextEncoder().encode("<svg onload=alert(1)>")),
  );
  assert.throws(() => imageType(new Uint8Array(MAX_IMAGE_BYTES + 1)));
});

test("CA 30 and exam 70 combine to the requested final total", () => {
  const marks = [
    {
      id: "ca1",
      studentId: "s",
      courseId: "c",
      title: "CA1",
      category: "ca" as const,
      score: 10,
      maxScore: 15,
      source: "manual" as const,
    },
    {
      id: "ca2",
      studentId: "s",
      courseId: "c",
      title: "CA2",
      category: "ca" as const,
      score: 15,
      maxScore: 15,
      source: "manual" as const,
    },
    {
      id: "exam",
      studentId: "s",
      courseId: "c",
      title: "Exam",
      category: "exam" as const,
      score: 50,
      maxScore: 70,
      source: "manual" as const,
    },
  ];
  assert.equal(calculateResult(marks).overallPercent, 75);
  assert.equal(calculateResult(marks).provisional, false);
  assert.equal(calculateResult(marks.slice(0, 2)).provisional, true);
  const auto = {
    id: "auto",
    studentId: "s",
    courseId: "c",
    title: "Assignment",
    category: "ca" as const,
    score: 100,
    maxScore: 100,
    source: "assignment" as const,
  };
  assert.equal(calculateResult([...marks, auto]).overallPercent, 75);
});
test("assignment formats validate content and size", () => {
  assert.equal(
    submissionFileType(
      "answer.txt",
      new TextEncoder().encode("An assignment answer"),
    ),
    "text/plain",
  );
  assert.equal(
    submissionFileType("work.pdf", new TextEncoder().encode("%PDF-1.4")),
    "application/pdf",
  );
  assert.throws(() => submissionFileType("bad.exe", new Uint8Array([1])));
  assert.throws(() =>
    submissionFileType("fake.pdf", new TextEncoder().encode("not a PDF")),
  );
  assert.throws(() =>
    submissionFileType("big.txt", new Uint8Array(MAX_SUBMISSION_BYTES + 1)),
  );
});
