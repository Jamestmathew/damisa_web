import test from "node:test";
import assert from "node:assert/strict";
import {
  sessionSigningKey,
  SessionConfigurationError,
} from "../src/shared/security/session-config.ts";
test("missing, short or whitespace-only signing configuration fails closed", () => {
  for (const value of [undefined, "", "short", " ".repeat(64)])
    assert.throws(() => sessionSigningKey(value), SessionConfigurationError);
});
test("session signing keeps the configured key bytes and never prints its value", () => {
  const value = "a-random-test-only-signing-key-with-32-characters";
  assert.deepEqual(sessionSigningKey(value), new TextEncoder().encode(value));
  try {
    sessionSigningKey("private-short-key");
    assert.fail("must reject");
  } catch (error) {
    assert.ok(error instanceof SessionConfigurationError);
    assert.ok(!error.message.includes("private-short-key"));
  }
});
