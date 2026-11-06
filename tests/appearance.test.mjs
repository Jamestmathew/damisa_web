import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
const state = {
  user: { id: "own-user", role: "student" },
  metadata: { staffType: "intern" },
  writes: [],
  clears: 0,
};
globalThis.__appearance = state;
state.db = {
  auth: {
    admin: {
      async getUserById(id) {
        assert.equal(id, state.user.id);
        return {
          data: { user: { user_metadata: state.metadata } },
          error: null,
        };
      },
      async updateUserById(id, input) {
        state.writes.push({ id, input });
        state.metadata = input.user_metadata;
        return { error: null };
      },
    },
  },
};
const mocks = {
  "server-only": "",
  "@/modules/auth/lib/route-guard":
    "export async function requireAuth(){return globalThis.__appearance.user}",
  "@/shared/security/action":
    "export async function authorizeAction(roles){const user=globalThis.__appearance.user;if(!roles.includes(user.role))throw new Error('Access denied');return user}",
  "@/supabase/admin":
    "export function createAdminClient(){return globalThis.__appearance.db}",
  "@/shared/security/request-cache":
    "export const cacheRequest=fn=>fn; export async function clearRequestCache(){globalThis.__appearance.clears++}",
  "next/cache": "export function revalidatePath(){}",
  "@/modules/student/features/settings/services/settings.service":
    'export async function getPreferences(){return {appearance:{theme:"dark",compactSidebar:true}}}',
};
registerHooks({
  resolve(spec, ctx, next) {
    if (spec in mocks) return { url: "appearance:" + spec, shortCircuit: true };
    if (spec.startsWith("@/")) {
      const url = new URL("../src/" + spec.slice(2) + ".ts", import.meta.url);
      if (existsSync(url)) return { url: url.href, shortCircuit: true };
    }
    return next(spec, ctx);
  },
  load(url, ctx, next) {
    if (url.startsWith("appearance:"))
      return {
        format: "module",
        source: mocks[url.slice(11)],
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
const service = await import("../src/shared/account/appearance.service.ts");
const action = await import("../src/shared/account/save-appearance.action.ts");
test("all roles can save theme and compact-sidebar settings without an office assignment", async () => {
  for (const role of ["student", "tutor", "admin", "super_admin"]) {
    state.user = { id: role, role, officeId: null };
    state.metadata = { staffType: "intern" };
    const data = new FormData();
    data.set("theme", "dark");
    data.set("compactSidebar", "on");
    assert.equal(
      (await action.saveAccountAppearanceAction(null, data)).ok,
      true,
    );
    assert.deepEqual(await service.getAccountAppearance(), {
      theme: "dark",
      compactSidebar: true,
    });
    assert.equal(state.metadata.staffType, "intern");
    assert.equal(state.writes.at(-1).id, role);
  }
});
test("Student legacy appearance preferences are retained while other roles default to System", async () => {
  state.metadata = {};
  state.user = { id: "student", role: "student" };
  assert.equal((await service.getAccountAppearance()).theme, "dark");
  state.user = { id: "super", role: "super_admin", officeId: null };
  assert.deepEqual(await service.getAccountAppearance(), {
    theme: "system",
    compactSidebar: false,
  });
});
test("invalid appearance values cannot be persisted", async () => {
  state.user = { id: "admin", role: "admin" };
  const count = state.writes.length;
  const data = new FormData();
  data.set("theme", "invalid");
  assert.equal(
    (await action.saveAccountAppearanceAction(null, data)).ok,
    false,
  );
  assert.equal(state.writes.length, count);
});
