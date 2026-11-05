import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
const root = fileURLToPath(new URL("../", import.meta.url));
const mocks = {
  "@/shared/security/request-cache": "export const cacheRequest=fn=>fn;",
  "server-only": "export {};",
  "@/shared/security/context":
    "export async function getContext(){return globalThis.__lmsTest.context;}",
  "@/supabase/admin":
    "export function createAdminClient(){return globalThis.__lmsTest.db;}",
  "@/shared/security/rate-limit": "export async function enforceRateLimit(){}",
};
registerHooks({
  resolve(specifier, context, next) {
    if (Object.hasOwn(mocks, specifier))
      return { url: `lms-mock:${specifier}`, shortCircuit: true };
    if (specifier.startsWith("@/")) {
      let relative = specifier
        .slice(2)
        .replace(/^shared\//, "src/shared/")
        .replace(/^modules\//, "src/modules/")
        .replace(/^supabase\//, "src/lib/supabase/");
      const file = [relative, relative + ".ts", relative + "/index.ts"]
        .map((p) => root + p)
        .find((p) => existsSync(p) && statSync(p).isFile());
      if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
    }
    if (specifier.startsWith(".") && context.parentURL?.endsWith(".ts")) {
      const url = new URL(specifier + ".ts", context.parentURL);
      if (existsSync(fileURLToPath(url)))
        return { url: url.href, shortCircuit: true };
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith("lms-mock:"))
      return {
        format: "module",
        source: mocks[url.slice(9)],
        shortCircuit: true,
      };
    if (url.endsWith(".ts"))
      return {
        format: "module",
        source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
          compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.ESNext,
          },
        }).outputText,
        shortCircuit: true,
      };
    return next(url, context);
  },
});
let rows = [];
class Query {
  filters = [];
  operation = "read";
  values = null;
  range() {
    return this;
  }
  select() {
    return this;
  }
  order() {
    return this;
  }
  eq(k, v) {
    this.filters.push((r) => r[k] === v);
    return this;
  }
  insert(values) {
    this.operation = "insert";
    this.values = values;
    return this;
  }
  update(values) {
    this.operation = "update";
    this.values = values;
    return this;
  }
  delete() {
    this.operation = "delete";
    return this;
  }
  async single() {
    const result = await this.execute();
    return {
      data: result.data?.[0] ?? null,
      error: result.data?.length === 1 ? null : { message: "no row" },
    };
  }
  async execute() {
    const matched = rows.filter((r) => this.filters.every((f) => f(r)));
    if (this.operation === "read")
      return { data: structuredClone(matched), error: null };
    if (this.operation === "insert") {
      const row = { ...this.values, created_at: new Date().toISOString() };
      rows.push(structuredClone(row));
      return { data: [row], error: null };
    }
    if (this.operation === "update") {
      matched.forEach((r) => Object.assign(r, structuredClone(this.values)));
      return { data: matched, error: null };
    }
    rows = rows.filter((r) => !matched.includes(r));
    return { data: matched, error: null };
  }
  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}
globalThis.__lmsTest = {
  context: { user: { id: "student-1", role: "student" }, officeId: "office-a" },
  db: {
    from() {
      return new Query();
    },
  },
};
const { listRecords, saveRecord, getRecord } = await import(
  "../src/shared/data/records.ts"
);
const record = (id, kind, office, owner, payload) => ({
  id,
  kind,
  office_id: office,
  owner_id: owner,
  payload,
  revision: 1,
  created_at: "2026-01-01",
});
function context(role, id) {
  globalThis.__lmsTest.context = { user: { id, role }, officeId: "office-a" };
}
function seed() {
  rows = [
    record("class-a", "class", "office-a", "admin", {
      studentIds: ["student-1"],
      courseIds: ["course-a"],
    }),
    record("class-b", "class", "office-a", "admin", {
      studentIds: ["student-2"],
      courseIds: ["course-b"],
    }),
    record("course-a", "course", "office-a", "tutor-1", {
      status: "published",
    }),
    record("course-b", "course", "office-a", "tutor-2", {
      status: "published",
    }),
    record("draft", "course", "office-a", "tutor-1", { status: "draft" }),
    record("foreign", "course", "office-b", "tutor-1", { status: "published" }),
    record("quiz-a", "quiz", "office-a", "tutor-1", { courseId: "course-a" }),
    record("quiz-b", "quiz", "office-a", "tutor-2", { courseId: "course-b" }),
    record("sub-a", "submission", "office-a", "student-1", {
      courseId: "course-a",
      studentId: "student-1",
      submissionText: "private",
      score: null,
      status: "submitted",
    }),
    record("sub-b", "submission", "office-a", "student-2", {
      courseId: "course-b",
      studentId: "student-2",
      submissionText: "private",
      score: null,
      status: "submitted",
    }),
  ];
}
test("student reads only enrolled published courses and own submissions", async () => {
  seed();
  context("student", "student-1");
  assert.deepEqual(
    (await listRecords("course")).map((r) => r.id),
    ["course-a"],
  );
  assert.deepEqual(
    (await listRecords("quiz")).map((r) => r.id),
    ["quiz-a"],
  );
  assert.deepEqual(
    (await listRecords("submission")).map((r) => r.id),
    ["sub-a"],
  );
  assert.equal(await getRecord("quiz", "quiz-b"), null);
});
test("tutor reads only owned teaching records and related submissions", async () => {
  seed();
  context("tutor", "tutor-1");
  assert.deepEqual(
    (await listRecords("course")).map((r) => r.id),
    ["course-a", "draft"],
  );
  assert.deepEqual(
    (await listRecords("submission")).map((r) => r.id),
    ["sub-a"],
  );
  await assert.rejects(listRecords("payment"), /Access denied/);
});
test("cross-office and cross-tutor mutation is denied", async () => {
  seed();
  context("tutor", "tutor-1");
  await assert.rejects(
    saveRecord("course", { status: "published" }, "course-b"),
    /access denied/,
  );
  await assert.rejects(
    saveRecord("lesson", { courseId: "foreign", published: true }),
    /access denied/,
  );
  await assert.rejects(saveRecord("class", {}), /permission/);
});
test("tutors can grade but cannot rewrite a student's submission", async () => {
  seed();
  context("tutor", "tutor-1");
  const submission = await getRecord("submission", "sub-a");
  await saveRecord(
    "submission",
    { ...submission, score: 10, status: "graded" },
    "sub-a",
  );
  assert.equal((await getRecord("submission", "sub-a")).score, 10);
  await assert.rejects(
    saveRecord(
      "submission",
      {
        ...(await getRecord("submission", "sub-a")),
        submissionText: "tampered",
      },
      "sub-a",
    ),
    /only grade/,
  );
  await assert.rejects(
    saveRecord("submission", { courseId: "course-a", studentId: "student-1" }),
    /cannot create/,
  );
});
test("student cannot write courses, payments, or another student's record", async () => {
  seed();
  context("student", "student-1");
  await assert.rejects(saveRecord("course", {}), /permission/);
  await assert.rejects(saveRecord("payment", {}), /permission/);
  await assert.rejects(
    saveRecord("submission", { courseId: "course-b" }, "sub-b"),
    /access denied/,
  );
});
test("new records persist across requests and are scoped to the office and owner", async () => {
  seed();
  context("tutor", "tutor-1");
  const course = await saveRecord("course", {
    status: "draft",
    title: "Saved course",
  });
  assert.equal((await getRecord("course", course.id)).title, "Saved course");
  context("tutor", "tutor-2");
  assert.equal(await getRecord("course", course.id), null);
  context("admin", "admin");
  assert.equal((await getRecord("course", course.id)).title, "Saved course");
  assert.equal(await getRecord("course", "foreign"), null);
});

test("stale concurrent updates cannot silently overwrite a newer version", async () => {
  seed();
  context("tutor", "tutor-1");
  const first = await getRecord("course", "course-a");
  const stale = await getRecord("course", "course-a");
  await saveRecord("course", { ...first, title: "First update" }, first.id);
  await assert.rejects(
    saveRecord("course", { ...stale, title: "Lost update" }, stale.id),
    /changed in another session/,
  );
  assert.equal((await getRecord("course", "course-a")).title, "First update");
});

test("students see only their own fees and linked manual payments", async () => {
  seed();
  rows.push(
    record("fee-a", "student_fee", "office-a", "admin", {
      studentId: "student-1",
      totalDueNaira: 100000,
    }),
    record("fee-b", "student_fee", "office-a", "admin", {
      studentId: "student-2",
      totalDueNaira: 200000,
    }),
    record("income", "payment", "office-a", "admin", {
      studentId: null,
      amountNaira: 50000,
    }),
    record("payment-a", "payment", "office-a", "admin", {
      studentId: "student-1",
      amountNaira: 25000,
    }),
  );
  context("student", "student-1");
  assert.deepEqual(
    (await listRecords("student_fee")).map((f) => f.id),
    ["fee-a"],
  );
  assert.deepEqual(
    (await listRecords("payment")).map((p) => p.id),
    ["payment-a"],
  );
  await assert.rejects(saveRecord("student_fee", {}), /permission/);
  context("tutor", "tutor-1");
  await assert.rejects(listRecords("student_fee"), /Access denied/);
});
