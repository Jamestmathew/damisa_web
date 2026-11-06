import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
const state = {
  user: { id: "student-a", role: "student", officeId: "office-a" },
  rows: [],
  created: [],
  profiles: [],
  deleted: [],
  failProfile: false,
  duplicate: false,
  uploads: [],
};
globalThis.__mvp = state;
function query(table) {
  const filters = [];
  let write = null;
  const q = {
    select() {
      return q;
    },
    eq(k, v) {
      filters.push((r) => r[k] === v);
      return q;
    },
    in(k, v) {
      filters.push((r) => v.includes(r[k]));
      return q;
    },
    ilike() {
      return q;
    },
    order() {
      return q;
    },
    range() {
      return q;
    },
    limit() {
      return Promise.resolve({
        data: state.duplicate ? [{ id: "existing" }] : [],
        error: null,
      });
    },
    update(value) {
      write = value;
      return q;
    },
    upsert(value) {
      write = value;
      state.profiles.push(value);
      return q;
    },
    insert(value) {
      write = value;
      state.rows.push(value);
      return q;
    },
    single() {
      return Promise.resolve({
        data: write ? { id: write.id ?? state.user.id } : { avatar_url: null },
        error: state.failProfile ? { message: "Profile failed" } : null,
      });
    },
    then(resolve, reject) {
      return Promise.resolve({
        data: write
          ? null
          : (table === "profiles"
              ? (state.directory ?? [])
              : table === "offices"
                ? (state.offices ?? [])
                : state.rows
            ).filter((r) => filters.every((f) => f(r))),
        error: null,
      }).then(resolve, reject);
    },
  };
  return q;
}
state.db = {
  from: query,
  auth: {
    admin: {
      async getUserById(id) {
        return {
          data: { user: { id, user_metadata: state.metadata?.[id] ?? {} } },
          error: null,
        };
      },
      async createUser(input) {
        state.created.push(input);
        return { data: { user: { id: "new-student" } }, error: null };
      },
      async deleteUser(id) {
        state.deleted.push(id);
        return { error: null };
      },
    },
  },
  storage: {
    async getBucket() {
      return { data: { public: false }, error: null };
    },
    from() {
      return {
        async upload(path) {
          state.uploads.push(path);
          return { error: null };
        },
        async remove(paths) {
          state.deleted.push(...paths);
          return { error: null };
        },
      };
    },
  },
};
const mocks = {
  "server-only": "",
  "@/shared/security/context":
    "export async function getContext(){const user=globalThis.__mvp.user;return {user,officeId:user.officeId}}",
  "@/modules/auth/lib/route-guard":
    "export async function requireAuth(){return globalThis.__mvp.user}",
  "@/shared/security/rate-limit": "export async function enforceRateLimit(){}",
  "@/shared/security/request-cache":
    "export function cacheRequest(fn){return fn} export async function clearRequestCache(){}",
  "@/supabase/admin":
    "export function createAdminClient(){return globalThis.__mvp.db}",
  "@/shared/security/revoke-sessions":
    "export async function invalidateSessions(){}",
  "@/shared/rbac":
    "export async function requirePermission(){return globalThis.__mvp.user} export async function requireRole(roles){const user=globalThis.__mvp.user;if(!roles.includes(user.role))throw new Error('Access denied');return user}",
  "@/shared/data/pagination":
    "export async function collectRows(q){const result=await q;if(result.error)throw result.error;return result.data}",
};
registerHooks({
  resolve(spec, ctx, next) {
    if (spec in mocks) return { url: "mvp:" + spec, shortCircuit: true };
    if (spec.startsWith("@/")) {
      let path = new URL("../src/" + spec.slice(2) + ".ts", import.meta.url);
      if (existsSync(path)) return { url: path.href, shortCircuit: true };
    }
    if (
      spec.startsWith(".") &&
      ctx.parentURL?.endsWith(".ts") &&
      !spec.endsWith(".ts")
    ) {
      const path = new URL(spec + ".ts", ctx.parentURL);
      if (existsSync(path)) return { url: path.href, shortCircuit: true };
    }
    return next(spec, ctx);
  },
  load(url, ctx, next) {
    if (url.startsWith("mvp:"))
      return {
        format: "module",
        source: mocks[url.slice(4)],
        shortCircuit: true,
      };
    if (url.endsWith(".ts"))
      return {
        format: "module",
        source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
          },
        }).outputText,
        shortCircuit: true,
      };
    return next(url, ctx);
  },
});
const records = await import("../src/shared/data/records.ts");
const users = await import(
  "../src/modules/admin/features/users/services/users.service.ts"
);
const storage = await import("../src/shared/media/storage.ts");
const { userFormSchema } = await import(
  "../src/modules/admin/features/users/validation/user-form.schema.ts"
);
const { assignmentFormSchema } = await import(
  "../src/modules/tutor/features/assignments/validation/assignment.schema.ts"
);
function row(id, kind, payload, owner = "tutor-a", office = "office-a") {
  return { id, kind, payload, owner_id: owner, office_id: office, revision: 1 };
}
const fixtures = [
  row(
    "link",
    "class",
    { type: "tutor_assignment", tutorId: "tutor-a", studentIds: ["student-a"] },
    "admin-a",
  ),
  row("course-a", "course", { instructorId: "tutor-a", status: "published" }),
  row("draft", "course", { instructorId: "tutor-a", status: "draft" }),
  row(
    "course-b",
    "course",
    { instructorId: "tutor-b", status: "published" },
    "tutor-b",
  ),
  row(
    "cross-office",
    "course",
    { instructorId: "tutor-a", status: "published" },
    "tutor-a",
    "office-b",
  ),
  row("assignment", "assignment", { courseId: "course-a" }),
  row("hidden-assignment", "assignment", { courseId: "course-b" }, "tutor-b"),
];
async function reset(role = "student", officeId = "office-a") {
  state.user = {
    id:
      role === "student"
        ? "student-a"
        : role === "admin"
          ? "admin-a"
          : "tutor-a",
    role,
    officeId,
  };
  state.rows = structuredClone(fixtures);
  state.created = [];
  state.profiles = [];
  state.deleted = [];
  state.uploads = [];
  state.failProfile = false;
  state.duplicate = false;
  await records.invalidateRecordCache();
}
test("tutor assignment reveals only assigned published courses and their assignments", async () => {
  await reset();
  assert.deepEqual(
    (await records.listRecords("course")).map((r) => r.id),
    ["course-a"],
  );
  assert.deepEqual(
    (await records.listRecords("assignment")).map((r) => r.id),
    ["assignment"],
  );
});
test("newly created tutor courses become available without editing enrollment", async () => {
  await reset();
  state.rows.push(
    row("new-course", "course", {
      instructorId: "tutor-a",
      status: "published",
    }),
  );
  assert.deepEqual(
    (await records.listRecords("course")).map((r) => r.id),
    ["course-a", "new-course"],
  );
});
test("reassigning or removing tutor removes access through that assignment", async () => {
  await reset();
  state.rows[0].payload.tutorId = "tutor-b";
  assert.deepEqual(
    (await records.listRecords("course")).map((r) => r.id),
    ["course-b"],
  );
  await records.invalidateRecordCache();
  state.rows[0].payload.tutorId = "";
  assert.equal((await records.listRecords("course")).length, 0);
});
test("tutors cannot see another tutor's courses or edit enrollment", async () => {
  await reset("tutor");
  assert.deepEqual(
    (await records.listRecords("course")).map((r) => r.id),
    ["course-a", "draft"],
  );
  await assert.rejects(records.saveRecord("class", {}), /permission/);
});
test("admin enrollment counts resolve current tutor courses too", async () => {
  await reset("admin");
  assert.deepEqual((await records.listRecords("class"))[0].courseIds, [
    "course-a",
    "draft",
  ]);
});
test("student creation provisions an active office profile without relying on an auth trigger", async () => {
  await reset("admin");
  const result = await users.createUser({
    name: "Test Student",
    email: "",
    role: "student",
    matricNumber: "SMI/2026/001",
  });
  assert.equal(result.ok, true);
  assert.match(state.created[0].email, /@students.invalid$/);
  assert.equal(state.profiles[0].id, "new-student");
  assert.equal(state.profiles[0].office_id, "office-a");
  assert.equal(state.profiles[0].status, "active");
});
test("duplicate matric number prevents auth creation and failed provisioning rolls back", async () => {
  await reset("admin");
  state.duplicate = true;
  assert.equal(
    (
      await users.createUser({
        name: "Test",
        email: "",
        role: "student",
        matricNumber: "SMI/001",
      })
    ).ok,
    false,
  );
  assert.equal(state.created.length, 0);
  state.duplicate = false;
  state.failProfile = true;
  assert.equal(
    (
      await users.createUser({
        name: "Test",
        email: "",
        role: "student",
        matricNumber: "SMI/002",
      })
    ).ok,
    false,
  );
  assert.deepEqual(state.deleted, ["new-student"]);
});
test("students need matric numbers and tutors need both email and staff ID", () => {
  assert.equal(
    userFormSchema.safeParse({
      name: "Student",
      email: "",
      role: "student",
      matricNumber: "SMI/001",
    }).success,
    true,
  );
  assert.equal(
    userFormSchema.safeParse({
      name: "Tutor",
      email: "tutor@example.com",
      role: "tutor",
    }).success,
    false,
  );
});
test("Super Admin without an office can upload only their own profile image", async () => {
  await reset("super_admin", null);
  state.user.id = "founder";
  const png = new File(
    [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])],
    "avatar.png",
  );
  const path = await storage.uploadImage(png, "accounts/founder/profile");
  assert.match(path, /^accounts\/founder\/profile\//);
  await assert.rejects(
    storage.uploadImage(png, "accounts/someone-else/profile"),
    /access denied/,
  );
  await assert.rejects(
    storage.removeImage("accounts/someone-else/profile/a.png"),
    /access denied/,
  );
});
test("project and assignment use the same validated submission/grading setup", () => {
  for (const workType of ["assignment", "project"]) {
    assert.equal(
      assignmentFormSchema.safeParse({
        workType,
        courseId: "course-a",
        title: "MVP Project",
        dueAt: "2027-01-01T12:00",
        instructions: "Submit the project files",
        maxScore: 100,
      }).success,
      true,
    );
  }
});

const announcements = await import("../src/shared/data/admin-announcements.ts");
const finance = await import(
  "../src/modules/super-admin/features/finance/service.ts"
);
test("Admin staff announcements reach tutors without exposing student-only or other-office messages", async () => {
  await reset("tutor");
  state.directory = [{ id: "admin-a", role: "admin", office_id: "office-a" }];
  state.rows = [
    row(
      "staff",
      "announcement",
      { audience: "tutors", title: "Staff message" },
      "admin-a",
    ),
    row(
      "both",
      "announcement",
      { audience: "everyone", title: "Combined message" },
      "admin-a",
    ),
    row("students", "announcement", { audience: "students" }, "admin-a"),
    row(
      "other-office",
      "announcement",
      { audience: "everyone" },
      "admin-a",
      "office-b",
    ),
    row("other-tutor", "announcement", { audience: "everyone" }, "tutor-b"),
  ];
  assert.deepEqual(
    (await announcements.getStaffAnnouncements()).map((a) => a.id),
    ["both", "staff"],
  );
  state.user.role = "student";
  await assert.rejects(announcements.getStaffAnnouncements(), /Access denied/);
});
test("finance reporting is readable across offices only by Super Admin", async () => {
  await reset("super_admin", null);
  state.offices = [
    { id: "office-a", name: "Campus A" },
    { id: "office-b", name: "Campus B" },
  ];
  state.rows = [
    row("pay-a", "payment", { amountNaira: 500, status: "paid" }, "admin-a"),
    row(
      "pay-b",
      "payment",
      { amountNaira: 300, status: "pending" },
      "admin-b",
      "office-b",
    ),
  ];
  assert.deepEqual(
    (await finance.getFinanceReports()).map((r) => r.officeName),
    ["Campus A", "Campus B"],
  );
  state.user.role = "admin";
  await assert.rejects(finance.getFinanceReports(), /Access denied/);
});

const officeService = await import(
  "../src/modules/super-admin/features/offices/services/offices.service.ts"
);
test("national company overview counts students, staff, interns and confirmed company income", async () => {
  await reset("super_admin", null);
  state.offices = [
    { id: "office-a", name: "Campus A" },
    { id: "office-b", name: "Campus B" },
  ];
  state.directory = [
    { id: "admin-a", name: "Admin A", role: "admin", office_id: "office-a" },
    { id: "tutor-a", role: "tutor", office_id: "office-a" },
    { id: "intern-a", role: "tutor", office_id: "office-a" },
    { id: "student-a", role: "student", office_id: "office-a" },
    { id: "admin-b", role: "admin", office_id: "office-b" },
  ];
  state.metadata = {
    "admin-a": { officeState: "Lagos" },
    "intern-a": { staffType: "intern" },
  };
  state.rows = [
    row("paid", "payment", { amountNaira: 500, status: "paid" }, "admin-a"),
    row(
      "pending",
      "payment",
      { amountNaira: 100, status: "pending" },
      "admin-a",
    ),
    row(
      "paid-b",
      "payment",
      { amountNaira: 300, status: "paid" },
      "admin-b",
      "office-b",
    ),
  ];
  const offices = await officeService.getOffices();
  assert.equal(offices[0].totalStaff, 3);
  assert.equal(offices[0].totalInterns, 1);
  assert.equal(offices[0].totalStudents, 1);
  assert.equal(offices[0].state, "Lagos");
  assert.equal(offices[0].totalRevenueNaira, 500);
  assert.equal(offices[1].totalRevenueNaira, 300);
  state.user.role = "admin";
  await assert.rejects(officeService.getOffices(), /Access denied/);
});
test("Admin can classify an intern while preserving tutor-level permissions", async () => {
  await reset("admin");
  const result = await users.createUser({
    name: "Intern Tutor",
    email: "intern@example.com",
    role: "tutor",
    staffType: "intern",
    staffId: "INT-001",
  });
  assert.equal(result.ok, true);
  assert.equal(state.created[0].user_metadata.staffType, "intern");
  assert.equal(state.profiles[0].role, "tutor");
});
