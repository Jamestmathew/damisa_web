import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/supabase/admin";

export class RateLimitError extends Error {
  constructor(public retryAfter: number) {
    super(`Too many requests. Try again in ${retryAfter} seconds.`);
  }
}

// Atomic PostgreSQL counters work across Vercel instances. No process-memory fallback.
export async function enforceRateLimit(
  scope: string,
  identity: string,
  limit = 30,
  windowSeconds = 60,
) {
  const key = createHash("sha256").update(`${scope}:${identity}`).digest("hex");
  const { data, error } = await createAdminClient().rpc("consume_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error || !data)
    throw new Error(
      "Request protection is temporarily unavailable. Please try again.",
    );
  if (!data.allowed) throw new RateLimitError(data.retry_after);
}

export async function enforceAuthRateLimit(scope: string, identifier = "") {
  const requestHeaders = await headers();
  // Only trust the platform-overwritten address in Vercel, not arbitrary forwarded headers.
  const address =
    process.env.VERCEL === "1"
      ? (requestHeaders.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown")
      : "local";
  await enforceRateLimit(`${scope}:ip`, address, 20, 900);
  if (identifier)
    await enforceRateLimit(
      `${scope}:account`,
      identifier.trim().toLowerCase(),
      8,
      900,
    );
}
