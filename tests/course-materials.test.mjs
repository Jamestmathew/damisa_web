import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
const state = {
  user: { id: "tutor-a", role: "tutor", officeId: "office-a" },
  course: null,
  objects: new Map(),
  limit: 3e6,
  header: "%PDF-1.7\n test",
  networkError: false,
  issued: [],
};
globalThis.__materials = state;
state.get = async (id) => {
  const c = state.course;
  return c &&
    c.id === id &&
    c.officeId === state.user.officeId &&
    (state.user.role === "admin" || c.ownerId === state.user.id)
    ? structuredClone(c)
    : null;
};
state.save = async (_kind, payload) => {
  if (payload.__revision !== state.course.__revision)
    throw new Error("Concurrent change");
  state.course = {
    ...structuredClone(payload),
    __revision: payload.__revision + 1,
  };
  return state.course;
};
const storage = {
  async info(path) {
    return state.objects.has(path)
      ? { data: { size: state.objects.get(path) }, error: null }
      : { data: null, error: { message: "Not found" } };
  },
  async createSignedUploadUrl(path, options) {
    state.issued.push({ path, options });
    return { data: { token: "scoped-upload-token" }, error: null };
  },
  async createSignedUrl() {
    return { data: { signedUrl: "https://storage.example/file" }, error: null };
  },
  async remove(paths) {
    paths.forEach((path) => state.objects.delete(path));
    return { error: null };
  },
};
state.db = {
  from() {
    return {
      select() {
        return this;
      },
      eq() {
        return this;
      },
      order() {
        return this;
      },
    };
  },
  storage: {
    async getBucket() {
      return {
        data: { public: false, file_size_limit: state.limit },
        error: null,
      };
    },
    async updateBucket() {
      return { error: state.limit<3e6 ? {message:"Configured global limit too small"} : null };
    },
    from() {
      return storage;
    },
  },
};
const mocks = {
  "server-only": "",
  "@/shared/data/pagination":
    "export async function collectRows(){return [{payload:{materials:globalThis.__materials.course.materials}}]}",
  "@/shared/security/context":
    "export async function getContext(){return {user:globalThis.__materials.user,officeId:globalThis.__materials.user.officeId}}",
  "@/shared/security/rate-limit": "export async function enforceRateLimit(){}",
  "@/shared/data/records":
    "export const getRecord=(_kind,id)=>globalThis.__materials.get(id); export const saveRecord=(...args)=>globalThis.__materials.save(...args);",
  "@/supabase/admin":
    "export function createAdminClient(){return globalThis.__materials.db}",
};
registerHooks({
  resolve(spec, ctx, next) {
    if (spec in mocks) return { url: "materials:" + spec, shortCircuit: true };
    if (
      spec.startsWith(".") &&
      ctx.parentURL?.endsWith(".ts") &&
      !spec.endsWith(".ts")
    ) {
      const url = new URL(spec + ".ts", ctx.parentURL);
      if (existsSync(url)) return { url: url.href, shortCircuit: true };
    }
    return next(spec, ctx);
  },
  load(url, ctx, next) {
    if (url.startsWith("materials:"))
      return {
        format: "module",
        source: mocks[url.slice(10)],
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
const policy = await import("../src/shared/course-materials/policy.ts");
const service = await import("../src/shared/course-materials/service.ts");
globalThis.fetch = async () => {
  if (state.networkError) throw new Error("Temporary network error");
  return new Response(state.header);
};
function reset() {
  state.user = { id: "tutor-a", role: "tutor", officeId: "office-a" };
  state.course = {
    id: "course-a",
    officeId: "office-a",
    ownerId: "tutor-a",
    materials: [],
    __revision: 1,
  };
  state.objects.clear();
  state.limit = 3e6;
  state.header = "%PDF-1.7\n test";
  state.networkError = false;
  state.issued = [];
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://qa.supabase.co";
}
test("course files allow PDF documents and video, reject pictures and files over 3 MB", () => {
  assert.equal(
    policy.courseFileMetadata("Lesson.PDF", 3e6).mimeType,
    "application/pdf",
  );
  assert.throws(() => policy.courseFileMetadata("picture.jpg", 100));
  assert.throws(() => policy.courseFileMetadata("file.pdf", 3e6 + 1));
  assert.throws(() => policy.courseFileMetadata("file.pdf", 0));
  assert.equal(
    policy.courseFileMetadata("../lesson.pdf", 100).fileName,
    ".._lesson.pdf",
  );
});
test("content signatures reject pictures disguised as PDFs", () => {
  assert.doesNotThrow(() =>
    policy.validateCourseFileHeader(
      "notes.pdf",
      new TextEncoder().encode("%PDF-1.7"),
    ),
  );
  assert.throws(() =>
    policy.validateCourseFileHeader(
      "notes.pdf",
      new Uint8Array([255, 216, 255]),
    ),
  );
});
test("Tutor and Admin receive a private upload grant for their managed course", async () => {
  for (const role of ["tutor", "admin"]) {
    reset();
    state.user.role = role;
    const grant = await service.beginCourseUpload("course-a", "notes.pdf", 100);
    assert.match(grant.entry.path, /^office-a\/courses\/course-a\//);
    assert.equal(
      grant.endpoint,
      "https://qa.storage.supabase.co/storage/v1/upload/resumable/sign",
    );
    assert.equal(state.issued[0].options.upsert, false);
    assert.equal(state.course.materials[0].status, "pending");
  }
});
test("students, other tutors and other offices cannot issue upload grants", async () => {
  for (const change of [
    { role: "student" },
    { id: "another-tutor" },
    { officeId: "office-b" },
  ]) {
    reset();
    Object.assign(state.user, change);
    await assert.rejects(service.beginCourseUpload("course-a", "a.pdf", 100));
  }
});
test("course quota includes pending uploads and cannot be bypassed by concurrent reservations", async () => {
  reset();
  state.course.materials = [{ id: "large", sizeBytes: 149e6, status: "ready" }];
  await assert.rejects(
    service.beginCourseUpload("course-a", "large.pdf", 2e6),
    /exceed/,
  );
  reset();
  const results = await Promise.allSettled([
    service.beginCourseUpload("course-a", "a.pdf", 100),
    service.beginCourseUpload("course-a", "b.pdf", 100),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(state.course.materials.length, 1);
});
test("storage configuration failures stop uploads before reserving space", async () => {
  reset();
  state.limit = 2e6;
  await assert.rejects(
    service.beginCourseUpload("course-a", "notes.pdf", 2.5e6),
    /3 MB/,
  );
  assert.equal(state.course.materials.length, 0);
});
test("uploads are attached only after actual file size and content verification", async () => {
  reset();
  const grant = await service.beginCourseUpload("course-a", "notes.pdf", 100);
  state.objects.set(grant.entry.path, 100);
  await service.completeCourseUpload("course-a", grant.entry.id);
  assert.equal(state.course.materials[0].status, "ready");
  await service.completeCourseUpload("course-a", grant.entry.id);
});
test("wrong content is removed; temporary verification failures preserve uploaded files for retry", async () => {
  reset();
  let grant = await service.beginCourseUpload("course-a", "notes.pdf", 100);
  state.objects.set(grant.entry.path, 100);
  state.header = "not a PDF";
  await assert.rejects(
    service.completeCourseUpload("course-a", grant.entry.id),
    /contents/,
  );
  assert.equal(state.objects.size, 0);
  assert.equal(state.course.materials.length, 0);
  reset();
  grant = await service.beginCourseUpload("course-a", "notes.pdf", 100);
  state.objects.set(grant.entry.path, 100);
  state.networkError = true;
  await assert.rejects(
    service.completeCourseUpload("course-a", grant.entry.id),
  );
  assert.equal(state.objects.size, 1);
  assert.equal(state.course.materials[0].status, "pending");
});
test("resuming an existing pending upload does not reserve space twice", async () => {
  reset();
  const first = await service.beginCourseUpload("course-a", "notes.pdf", 100);
  const second = await service.beginCourseUpload("course-a", "notes.pdf", 100);
  assert.equal(first.entry.id, second.entry.id);
  assert.equal(state.course.materials.length, 1);
});
