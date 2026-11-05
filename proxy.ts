import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/shared/security/policy";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { AUTH_ROUTES } from "@/modules/auth/constants";
import { ROLE_HOME_PATH, type Role } from "@/shared/rbac";

const ROLE_PREFIXES: { prefix: string; role: Role }[] = [
  { prefix: "/student", role: "student" },
  { prefix: "/tutor", role: "tutor" },
  { prefix: "/admin", role: "admin" },
  { prefix: "/super-admin", role: "super_admin" },
];

const GUEST_ONLY_PATHS = [AUTH_ROUTES.login, AUTH_ROUTES.forgotPassword];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: Role | null = null;

  let boundaryValid = false;
  let sessionVersion: unknown;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (user && token && process.env.SESSION_SECRET) {
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.SESSION_SECRET),
        { algorithms: ["HS256"], issuer: "damisa-lms", audience: "session" },
      );
      sessionVersion = payload.version;
      boundaryValid = payload.sub === user.id && payload.purpose === "session";
    } catch {
      /* Expired or invalid sessions must sign in again. */
    }
  }
  if (user && boundaryValid) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status, session_version")
      .eq("id", user.id)
      .single();

    if (
      profile?.status === "active" &&
      profile.session_version === sessionVersion &&
      Object.hasOwn(ROLE_HOME_PATH, profile.role)
    ) {
      role = profile.role as Role;
    }
  }

  const { pathname } = request.nextUrl;

  const matchedRolePrefix = ROLE_PREFIXES.find(
    (entry) =>
      pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`),
  );

  const isGuestOnly = GUEST_ONLY_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  if (matchedRolePrefix || pathname.startsWith("/settings/")) {
    if (!role) {
      const loginUrl = new URL(AUTH_ROUTES.login, request.url);
      loginUrl.searchParams.set("from", pathname);

      const redirect = NextResponse.redirect(loginUrl);
      response.cookies
        .getAll()
        .forEach((cookie) => redirect.cookies.set(cookie));
      return redirect;
    }

    if (matchedRolePrefix && role !== matchedRolePrefix.role) {
      const redirect = NextResponse.redirect(
        new URL(ROLE_HOME_PATH[role], request.url),
      );
      response.cookies
        .getAll()
        .forEach((cookie) => redirect.cookies.set(cookie));
      return redirect;
    }
  }

  if (isGuestOnly && role) {
    const redirect = NextResponse.redirect(
      new URL(ROLE_HOME_PATH[role], request.url),
    );
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  return response;
}

export const config = {
  matcher: [
    "/student/:path*",
    "/settings/:path*",
    "/tutor/:path*",
    "/admin/:path*",
    "/super-admin/:path*",
    "/login",
    "/forgot-password",
  ],
};
