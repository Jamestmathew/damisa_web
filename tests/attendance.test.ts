import test from "node:test";
import assert from "node:assert/strict";
import {
  attendanceInstant,
  attendanceLocalTime,
} from "../src/shared/attendance/time.ts";
import { hasPermission } from "../src/shared/rbac/permissions.ts";
test("attendance uses office time independent of the browser timezone", () => {
  assert.equal(
    attendanceInstant("2026-10-31T08:32", "Africa/Lagos"),
    "2026-10-31T07:32:00.000Z",
  );
  assert.equal(
    attendanceLocalTime("2026-10-31T07:32:00Z", "Africa/Lagos"),
    "2026-10-31T08:32:00",
  );
  assert.throws(() =>
    attendanceInstant("2026-03-08T02:30", "America/New_York"),
  );
});
test("attendance oversight follows student and staff role boundaries", () => {
  assert.equal(hasPermission("admin", "attendance:students"), true);
  assert.equal(hasPermission("admin", "attendance:staff"), false);
  assert.equal(hasPermission("tutor", "attendance:students"), false);
  assert.equal(hasPermission("super_admin", "attendance:staff"), true);
  assert.equal(hasPermission("super_admin", "attendance:view_self"), false);
  assert.equal(hasPermission("student", "attendance:view_self"), true);
});

test("only Tutors and Admins can clock their own attendance", () => {
  assert.equal(hasPermission("tutor", "attendance:clock_self"), true);
  assert.equal(hasPermission("admin", "attendance:clock_self"), true);
  assert.equal(hasPermission("student", "attendance:clock_self"), false);
  assert.equal(hasPermission("super_admin", "attendance:clock_self"), false);
});

test("attendance approval roles separate students and Tutors from Admins", () => {
  assert.equal(
    hasPermission("admin", "attendance:approve_student_tutor"),
    true,
  );
  assert.equal(hasPermission("admin", "attendance:approve_admin"), false);
  assert.equal(hasPermission("super_admin", "attendance:approve_admin"), true);
  assert.equal(
    hasPermission("super_admin", "attendance:approve_student_tutor"),
    false,
  );
  assert.equal(
    hasPermission("tutor", "attendance:approve_student_tutor"),
    false,
  );
});
