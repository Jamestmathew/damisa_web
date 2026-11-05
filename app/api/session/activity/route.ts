import { isSameOriginRequest } from "@/shared/security/origin";
import { NextResponse } from "next/server";
import { getOptionalSession } from "@/modules/auth/lib/route-guard";
import { renewIdleSession } from "@/shared/security/session";
import { enforceRateLimit, RateLimitError } from "@/shared/security/rate-limit";
export async function POST(request: Request) {
  if (!isSameOriginRequest(request))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const user = await getOptionalSession();
  if (!user)
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  const id = request.headers.get("x-session-id");
  if (!id || id.length > 100)
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  try {
    await enforceRateLimit("session-activity", user.id, 6, 60);
    const state = await renewIdleSession(user.id, id);
    if (!state)
      return NextResponse.json({ error: "Session changed" }, { status: 409 });
    return NextResponse.json(
      { expiresAt: state.idleExpiresAt },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof RateLimitError)
      return NextResponse.json(
        { error: "Too many activity updates" },
        { status: 429, headers: { "Retry-After": String(error.retryAfter) } },
      );
    return NextResponse.json(
      { error: "Session update unavailable" },
      { status: 503 },
    );
  }
}
