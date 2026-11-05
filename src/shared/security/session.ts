import "server-only";
import { verifySessionState, type SessionState } from "./session-state";
import { sessionSigningKey } from "./session-config";
import { clearRequestCache } from "./request-cache";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import {
  IDLE_COOKIE,
  IDLE_SECONDS,
  SESSION_COOKIE,
  RECOVERY_COOKIE,
  SESSION_SECONDS,
  REMEMBER_SECONDS,
} from "./policy";

function secret() {
  return sessionSigningKey(process.env.SESSION_SECRET);
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
  const id = crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + seconds;
  const token = await new SignJWT({ purpose, version, remember })
    .setJti(id)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer("damisa-lms")
    .setAudience(purpose)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secret());
  (await cookies()).set(recovery ? RECOVERY_COOKIE : SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember || recovery ? { maxAge: seconds } : {}),
  });
  if (!recovery) {
    if (remember) (await cookies()).delete(IDLE_COOKIE);
    else
      await writeIdleCookie({
        id,
        userId,
        version,
        remember,
        expiresAt: expiresAt * 1000,
        idleExpiresAt: 0,
      });
  }
  await clearRequestCache();
}

export async function validSessionBoundary(
  userId: string,
  recovery = false,
  version?: number,
) {
  if (!recovery) return !!(await getSessionState(userId, version));
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
  jar.delete(IDLE_COOKIE);
  jar.delete(SESSION_COOKIE);
  jar.delete(RECOVERY_COOKIE);
  await clearRequestCache();
}

async function writeIdleCookie(state: SessionState) {
  const exp = Math.min(
    Math.floor(Date.now() / 1000) + IDLE_SECONDS,
    Math.floor(state.expiresAt / 1000),
  );
  const token = await new SignJWT({
    purpose: "idle",
    sid: state.id,
    version: state.version,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(state.userId)
    .setIssuer("damisa-lms")
    .setAudience("idle")
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(secret());
  (await cookies()).set(IDLE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: IDLE_SECONDS,
  });
  return exp * 1000;
}
export async function getSessionState(userId?: string, version?: number) {
  const jar = await cookies();
  return verifySessionState(
    jar.get(SESSION_COOKIE)?.value,
    jar.get(IDLE_COOKIE)?.value,
    secret(),
    userId,
    version,
  );
}
export async function renewIdleSession(userId: string, id: string) {
  const state = await getSessionState(userId);
  if (!state || state.id !== id) return null;
  if (state.remember) return state;
  state.idleExpiresAt = await writeIdleCookie(state);
  await clearRequestCache();
  return state;
}
