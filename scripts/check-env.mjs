import { existsSync } from "node:fs";
for (const file of [".env.local", ".env"])
  if (existsSync(file)) process.loadEnvFile(file);
const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SESSION_SECRET",
  "NEXT_PUBLIC_SITE_URL",
];
const missing = required.filter((name) => !process.env[name]);
if (!process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY)
  missing.push("SUPABASE_SECRET_KEY");
if (missing.length) {
  console.error("Missing environment variables:", missing.join(", "));
  process.exit(1);
}
if (process.env.SESSION_SECRET.length < 32) {
  console.error("SESSION_SECRET must have at least 32 characters.");
  process.exit(1);
}
for (const name of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SITE_URL"]) {
  try {
    const url = new URL(process.env[name]);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
  } catch {
    console.error(`${name} must be a valid HTTP(S) URL.`);
    process.exit(1);
  }
}
console.log(
  "Required environment variables are present. Secret values were not printed.",
);
