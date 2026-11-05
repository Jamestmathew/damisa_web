import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/supabase/server";
import { setSessionBoundary } from "@/shared/security/session";
import { safeLocalPath } from "@/shared/security/policy";
import { enforceAuthRateLimit } from "@/shared/security/rate-limit";

export async function GET(request: NextRequest) {
  try {
    await enforceAuthRateLimit("auth-confirm");
    const token_hash = request.nextUrl.searchParams.get("token_hash");
    const type = request.nextUrl.searchParams.get("type");
    if (!token_hash || !["recovery", "email", "invite"].includes(type ?? ""))
      throw new Error("Invalid link");
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "recovery" | "email" | "invite",
    });
    if (error || !data.user) throw new Error("Expired link");
    await setSessionBoundary(
      data.user.id,
      false,
      type === "recovery" || type === "invite",
    );
    const next =
      type === "recovery" || type === "invite"
        ? "/reset-password"
        : safeLocalPath(request.nextUrl.searchParams.get("next"), "/");
    return NextResponse.redirect(new URL(next, request.url));
  } catch {
    return NextResponse.redirect(
      new URL("/forgot-password?error=invalid-link", request.url),
    );
  }
}
