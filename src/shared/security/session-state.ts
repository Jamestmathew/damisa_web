import { jwtVerify } from "jose";
export interface SessionState {
  id: string;
  userId: string;
  version: number;
  remember: boolean;
  expiresAt: number;
  idleExpiresAt: number;
}
export async function verifySessionState(
  token: string | undefined,
  idle: string | undefined,
  key: Uint8Array,
  userId?: string,
  version?: number,
): Promise<SessionState | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
      issuer: "damisa-lms",
      audience: "session",
    });
    if (
      payload.purpose !== "session" ||
      typeof payload.sub !== "string" ||
      typeof payload.jti !== "string" ||
      typeof payload.exp !== "number" ||
      typeof payload.version !== "number" ||
      (userId !== undefined && payload.sub !== userId) ||
      (version !== undefined && payload.version !== version)
    )
      return null;
    const state: SessionState = {
      id: payload.jti,
      userId: payload.sub,
      version: payload.version,
      remember: payload.remember === true,
      expiresAt: payload.exp * 1000,
      idleExpiresAt: payload.exp * 1000,
    };
    if (state.remember) return state;
    if (!idle) return null;
    const { payload: activity } = await jwtVerify(idle, key, {
      algorithms: ["HS256"],
      issuer: "damisa-lms",
      audience: "idle",
    });
    if (
      activity.purpose !== "idle" ||
      activity.sub !== state.userId ||
      activity.sid !== state.id ||
      activity.version !== state.version ||
      typeof activity.exp !== "number"
    )
      return null;
    state.idleExpiresAt = Math.min(activity.exp * 1000, state.expiresAt);
    return state;
  } catch {
    return null;
  }
}
