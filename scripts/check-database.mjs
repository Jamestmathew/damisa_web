import "./check-env.mjs";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const checks = [
  [
    "Account/session schema",
    () => db.from("profiles").select("id,session_version").limit(1),
  ],
  [
    "Daily attendance schema",
    () => db.from("attendance_entries").select("id").limit(1),
  ],
  ["Office schema", () => db.from("offices").select("id").limit(1)],
  ["Feature storage", () => db.from("lms_records").select("id").limit(1)],
];
let failed = false;
for (const [label, query] of checks) {
  const { error } = await query();
  console.log(
    `${error ? "FAIL" : "PASS"}: ${label}${error ? ` (${error.code ?? "database error"})` : ""}`,
  );
  if (error) failed = true;
}
const key = `configuration-check:${randomUUID()}`;
const first = await db.rpc("consume_rate_limit", {
  p_key: key,
  p_limit: 1,
  p_window_seconds: 1,
});
const second = await db.rpc("consume_rate_limit", {
  p_key: key,
  p_limit: 1,
  p_window_seconds: 1,
});
if (
  first.error ||
  second.error ||
  !first.data?.allowed ||
  second.data?.allowed
) {
  console.log("FAIL: Distributed rate limiting");
  failed = true;
} else console.log("PASS: Distributed rate limiting");
if (failed) {
  console.error(
    "Apply all SQL migration files in supabase/migrations, then rerun this check.",
  );
  process.exit(1);
}
console.log(
  "Database configuration checks passed. No account data was changed.",
);
