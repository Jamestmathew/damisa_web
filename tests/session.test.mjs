import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { SignJWT } from "jose";
const jar = new Map();
globalThis.__sessionJar = {
  get: (key) => jar.get(key),
  set: (key, value, options) => jar.set(key, { value, options }),
  delete: (key) => jar.delete(key),
};
process.env.SESSION_SECRET =
  "a-test-only-signing-key-at-least-thirty-two-characters";
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "server-only" || specifier === "next/headers")
      return { url: `session-mock:${specifier}`, shortCircuit: true };
    if (specifier.startsWith(".") && context.parentURL?.endsWith(".ts")) {
      const url = new URL(specifier + ".ts", context.parentURL);
      if (existsSync(fileURLToPath(url)))
        return { url: url.href, shortCircuit: true };
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith("session-mock:"))
      return {
        format: "module",
        source: url.endsWith("next/headers")
          ? "export async function cookies(){return globalThis.__sessionJar;}"
          : "export {};",
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
const { setSessionBoundary, validSessionBoundary, clearSessionBoundary } =
  await import("../src/shared/security/session.ts");
test("signed sessions bind the user and revocation version", async () => {
  jar.clear();
  await setSessionBoundary("user-1", false, false, 3);
  assert.equal(await validSessionBoundary("user-1", false, 3), true);
  assert.equal(await validSessionBoundary("user-2", false, 3), false);
  assert.equal(await validSessionBoundary("user-1", false, 4), false);
  assert.equal(jar.get("lms_session").options.httpOnly, true);
  assert.equal(jar.get("lms_session").options.maxAge, undefined);
});
test("remember-me sets a bounded persistent cookie", async () => {
  jar.clear();
  await setSessionBoundary("user-1", true);
  assert.equal(jar.get("lms_session").options.maxAge, 30 * 24 * 60 * 60);
});
test("recovery cookies cannot authorize ordinary sessions", async () => {
  jar.clear();
  await setSessionBoundary("user-1", false, true);
  assert.equal(await validSessionBoundary("user-1", true), true);
  assert.equal(await validSessionBoundary("user-1"), false);
  assert.equal(jar.get("lms_recovery").options.maxAge, 600);
});
test("tampered and expired signed cookies are rejected", async () => {
  jar.clear();
  await setSessionBoundary("user-1");
  const valid = jar.get("lms_session").value;
  jar.get("lms_session").value = "x" + valid.slice(1);
  assert.equal(await validSessionBoundary("user-1"), false);
  jar.get("lms_session").value = await new SignJWT({
    purpose: "session",
    version: 0,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("user-1")
    .setIssuer("damisa-lms")
    .setAudience("session")
    .setExpirationTime(Math.floor(Date.now() / 1000) - 5)
    .sign(new TextEncoder().encode(process.env.SESSION_SECRET));
  assert.equal(await validSessionBoundary("user-1"), false);
});
test("logout removes session and recovery cookies", async () => {
  await setSessionBoundary("user-1");
  await setSessionBoundary("user-1", false, true);
  await clearSessionBoundary();
  assert.equal(jar.size, 0);
});

test("request caches are isolated between requests and can be invalidated", async () => {
  const { cacheRequest, clearRequestCache } = await import(
    "../src/shared/security/request-cache.ts"
  );
  let calls = 0;
  const read = cacheRequest(async (key) => ({ key, count: ++calls }));
  const original = globalThis.__sessionJar;
  assert.equal((await read("same")).count, 1);
  assert.equal((await read("same")).count, 1);
  globalThis.__sessionJar = { ...original };
  assert.equal((await read("same")).count, 2);
  await clearRequestCache();
  assert.equal((await read("same")).count, 3);
  globalThis.__sessionJar = original;
});
