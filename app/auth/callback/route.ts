import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/supabase/server";
import { setSessionBoundary } from "@/shared/security/session";
import { safeLocalPath } from "@/shared/security/policy";
import { enforceAuthRateLimit } from "@/shared/security/rate-limit";

export async function GET(request: NextRequest) {
  try {
    await enforceAuthRateLimit("auth-callback");
    const code = request.nextUrl.searchParams.get("code");
    if (!code) throw new Error("Missing code");
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) throw new Error("Invalid code");
    const next = safeLocalPath(request.nextUrl.searchParams.get("next"), "/");
    // The PKCE verifier is bound to the browser that requested the recovery email.
    await setSessionBoundary(data.user.id, false, next === "/reset-password");
    return NextResponse.redirect(new URL(next, request.url));
  } catch {
    return NextResponse.redirect(
      new URL("/forgot-password?error=invalid-link", request.url),
    );
  }
}
