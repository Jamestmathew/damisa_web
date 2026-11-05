import { isSameOriginRequest } from "@/shared/security/origin";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { SESSION_COOKIE } from "@/shared/security/policy";
import { clearSessionBoundary } from "@/shared/security/session";
export async function POST(request: Request) {
  if (!isSameOriginRequest(request))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const expected = request.headers.get("x-session-id");
  let id: string | undefined;
  try {
    id = decodeJwt((await cookies()).get(SESSION_COOKIE)?.value ?? "").jti;
  } catch {
    /* No valid browser boundary remains. */
  }
  // Comparing IDs only prevents an old tab from logging out a newer login.
  // It never grants access, refreshes a session, or trusts a client-supplied user.
  if (id && expected !== id)
    return NextResponse.json({ error: "Session changed" }, { status: 409 });
  await clearSessionBoundary();
  // End this browser session without an upstream Auth request per timeout.
  // Protected routes still require the cleared signed boundaries.
  const jar = await cookies();
  for (const cookie of jar.getAll())
    if (/^sb-.+-auth-token(?:\.\d+)?$/.test(cookie.name))
      jar.delete(cookie.name);

  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
