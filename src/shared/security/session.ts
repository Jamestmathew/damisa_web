import "server-only";
import { clearRequestCache } from "./request-cache";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import {
  SESSION_COOKIE,
  RECOVERY_COOKIE,
  SESSION_SECONDS,
  REMEMBER_SECONDS,
} from "./policy";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32)
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  return new TextEncoder().encode(value);
}

export async function setSessionBoundary(
  userId: string,
  remember = false,
  recovery = false,
  version = 0,
) {
  const seconds = recovery
    ? 600
    : remember
      ? REMEMBER_SECONDS
      : SESSION_SECONDS;
  const purpose = recovery ? "recovery" : "session";
  const token = await new SignJWT({ purpose, version })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer("damisa-lms")
    .setAudience(purpose)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + seconds)
    .sign(secret());
  (await cookies()).set(recovery ? RECOVERY_COOKIE : SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember || recovery ? { maxAge: seconds } : {}),
  });
  await clearRequestCache();
}

export async function validSessionBoundary(
  userId: string,
  recovery = false,
  version?: number,
) {
  const token = (await cookies()).get(
    recovery ? RECOVERY_COOKIE : SESSION_COOKIE,
  )?.value;
  if (!token) return false;
  const purpose = recovery ? "recovery" : "session";
  try {
    const { payload } = await jwtVerify(token, secret(), {
      algorithms: ["HS256"],
      issuer: "damisa-lms",
      audience: purpose,
    });
    return (
      payload.sub === userId &&
      payload.purpose === purpose &&
      (version === undefined || payload.version === version)
    );
  } catch {
    return false;
  }
}

export async function clearSessionBoundary() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(RECOVERY_COOKIE);
  await clearRequestCache();
}
