import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const script = fileURLToPath(
  new URL("../scripts/check-env.mjs", import.meta.url),
);
test("deployment preflight rejects missing/invalid signing secrets before publication", () => {
  const cwd = mkdtempSync(join(tmpdir(), "damisa-config-test-"));
  const env = {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-test-placeholder",
    NEXT_PUBLIC_SITE_URL: "https://damisaweb.vercel.app",
    SUPABASE_SECRET_KEY: "server-test-placeholder",
  };
  try {
    delete env.SESSION_SECRET;
    let run = spawnSync(process.execPath, [script], {
      cwd,
      env,
      encoding: "utf8",
    });
    assert.notEqual(run.status, 0);
    assert.match(run.stderr, /SESSION_SECRET/);
    run = spawnSync(process.execPath, [script], {
      cwd,
      env: { ...env, SESSION_SECRET: "private-short-key" },
      encoding: "utf8",
    });
    assert.notEqual(run.status, 0);
    assert.ok(!run.stderr.includes("private-short-key"));
    run = spawnSync(process.execPath, [script], {
      cwd,
      env: {
        ...env,
        SESSION_SECRET:
          "test-only-signing-key-longer-than-thirty-two-characters",
      },
      encoding: "utf8",
    });
    assert.equal(run.status, 0, run.stderr);
    assert.match(run.stdout, /Required environment variables are present/);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
