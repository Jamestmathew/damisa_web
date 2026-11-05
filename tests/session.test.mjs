import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { decodeJwt, SignJWT } from "jose";
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
  assert.equal(jar.get("lms_session").options.maxAge, 24 * 60 * 60);
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

test("normal sessions require a signed ten-minute idle proof", async () => {
  jar.clear();
  await setSessionBoundary("idle-user", false, false, 7);
  const { payload } = await import("jose").then(async ({ jwtVerify }) =>
    jwtVerify(
      jar.get("lms_idle").value,
      new TextEncoder().encode(process.env.SESSION_SECRET),
      { audience: "idle", issuer: "damisa-lms" },
    ),
  );
  assert.ok(payload.exp - Math.floor(Date.now() / 1000) <= 600);
  assert.equal(payload.version, 7);
  assert.equal(jar.get("lms_idle").options.httpOnly, true);
  jar.delete("lms_idle");
  assert.equal(await validSessionBoundary("idle-user", false, 7), false);
});
test("expired idle proof cannot be renewed even if the full session is still valid", async () => {
  jar.clear();
  await setSessionBoundary("idle-user", false, false, 7);
  const main = decodeJwt(jar.get("lms_session").value);
  jar.set("lms_idle", {
    value: await new SignJWT({ purpose: "idle", sid: main.jti, version: 7 })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("idle-user")
      .setIssuer("damisa-lms")
      .setAudience("idle")
      .setExpirationTime(Math.floor(Date.now() / 1000) - 1)
      .sign(new TextEncoder().encode(process.env.SESSION_SECRET)),
  });
  assert.equal(await validSessionBoundary("idle-user", false, 7), false);
  const { renewIdleSession } = await import(
    "../src/shared/security/session.ts"
  );
  assert.equal(await renewIdleSession("idle-user", main.jti), null);
});
test("idle proofs cannot be borrowed from another login or account", async () => {
  jar.clear();
  await setSessionBoundary("first-user");
  const first = jar.get("lms_idle");
  await setSessionBoundary("other-user");
  jar.set("lms_idle", first);
  assert.equal(await validSessionBoundary("other-user"), false);
  await setSessionBoundary("first-user");
  jar.set("lms_idle", first);
  assert.equal(await validSessionBoundary("first-user"), false);
});
test("remembered sessions persist for exactly 24 hours without an idle-cookie requirement", async () => {
  jar.clear();
  await setSessionBoundary("remember-user", true, false, 2);
  const claims = decodeJwt(jar.get("lms_session").value);
  assert.equal(claims.remember, true);
  assert.equal(claims.exp - claims.iat, 86400);
  assert.equal(jar.get("lms_session").options.maxAge, 86400);
  assert.equal(jar.has("lms_idle"), false);
  assert.equal(await validSessionBoundary("remember-user", false, 2), true);
  assert.equal(await validSessionBoundary("remember-user", false, 3), false);
});
test("activity renewal keeps the absolute session and login identity unchanged", async () => {
  jar.clear();
  await setSessionBoundary("idle-user");
  const original = jar.get("lms_session").value;
  const claims = decodeJwt(original);
  const { renewIdleSession } = await import(
    "../src/shared/security/session.ts"
  );
  assert.equal(await renewIdleSession("idle-user", "wrong-login"), null);
  const renewed = await renewIdleSession("idle-user", claims.jti);
  assert.ok(renewed);
  assert.equal(renewed.id, claims.jti);
  assert.equal(jar.get("lms_session").value, original);
});
