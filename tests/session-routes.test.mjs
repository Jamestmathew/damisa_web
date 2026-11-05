import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
const state = {
  user: { id: "qa-user" },
  renewals: 0,
  clears: 0,
  rate: [],
  block: false,
  changed: false,
  tokenId: "current-login",
};
globalThis.__idleRoute = state;
const mocks = {
  "next/server":
    "export class NextResponse extends Response{static json(value,init){return new NextResponse(JSON.stringify(value),init)}}",
  "next/headers":
    'export async function cookies(){return {get(){return globalThis.__idleRoute.tokenId?{value:"eyJhbGciOiJub25lIn0."+Buffer.from(JSON.stringify({jti:globalThis.__idleRoute.tokenId})).toString("base64url")+"."}:undefined;},getAll(){return []},delete(){}}}',
  "@/modules/auth/lib/route-guard":
    "export async function getOptionalSession(){return globalThis.__idleRoute.user}",
  "@/shared/security/session":
    "export async function renewIdleSession(user,id){const s=globalThis.__idleRoute;s.renewals++;return s.changed?null:{idleExpiresAt:123456};} export async function clearSessionBoundary(){globalThis.__idleRoute.clears++;}",
  "@/shared/security/rate-limit":
    "export class RateLimitError extends Error{constructor(){super();this.retryAfter=30}} export async function enforceRateLimit(...args){const s=globalThis.__idleRoute;s.rate.push(args);if(s.block)throw new RateLimitError();}",
};
registerHooks({
  resolve(spec, ctx, next) {
    if (spec in mocks) return { url: "idle-route:" + spec, shortCircuit: true };
    if (spec === "@/shared/security/origin")
      return {
        url: new URL("../src/shared/security/origin.ts", import.meta.url).href,
        shortCircuit: true,
      };
    if (spec === "@/shared/security/policy")
      return {
        url: new URL("../src/shared/security/policy.ts", import.meta.url).href,
        shortCircuit: true,
      };
    return next(spec, ctx);
  },
  load(url, ctx, next) {
    if (url.startsWith("idle-route:"))
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
const activity = await import("../app/api/session/activity/route.ts");
const end = await import("../app/api/session/end/route.ts");
function request(origin = "https://example.test", id = "current-login") {
  return new Request("https://example.test/api/session/activity", {
    method: "POST",
    headers: { origin, "x-session-id": id },
  });
}
test("activity rejects foreign origins and expired authentication without renewing", async () => {
  state.renewals = 0;
  assert.equal(
    (await activity.POST(request("https://attacker.test"))).status,
    403,
  );
  state.user = null;
  assert.equal((await activity.POST(request())).status, 401);
  assert.equal(state.renewals, 0);
  state.user = { id: "qa-user" };
});
test("activity uses a separate six-per-minute user limit and respects throttling", async () => {
  state.rate = [];
  state.renewals = 0;
  assert.equal((await activity.POST(request())).status, 200);
  assert.deepEqual(state.rate[0], ["session-activity", "qa-user", 6, 60]);
  state.block = true;
  const response = await activity.POST(request());
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "30");
  assert.equal(state.renewals, 1);
  state.block = false;
  state.changed = true;
  assert.equal((await activity.POST(request())).status, 409);
  state.changed = false;
});
test("an old tab cannot sign out a newer session and logout is same-origin only", async () => {
  state.clears = 0;
  assert.equal((await end.POST(request("https://attacker.test"))).status, 403);
  assert.equal(
    (await end.POST(request("https://example.test", "old-login"))).status,
    409,
  );
  assert.equal(state.clears, 0);
  assert.equal((await end.POST(request())).status, 200);
  assert.equal(state.clears, 1);
});

test("same-origin checks support Next's internal localhost URL without trusting foreign origins", async () => {
  const req = new Request("http://localhost:3112/api/session/activity", {
    method: "POST",
    headers: {
      host: "127.0.0.1:3112",
      origin: "http://127.0.0.1:3112",
      "x-session-id": "current-login",
    },
  });
  assert.equal((await activity.POST(req)).status, 200);
  const foreign = new Request("http://localhost:3112/api/session/activity", {
    method: "POST",
    headers: {
      host: "127.0.0.1:3112",
      origin: "http://attacker.test",
      "x-session-id": "current-login",
    },
  });
  assert.equal((await activity.POST(foreign)).status, 403);
});
