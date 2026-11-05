import "server-only";
import { sessionSigningKey } from "@/shared/security/session-config";
import { cacheRequest as cache } from "@/shared/security/request-cache";

import type { AuthResult, AuthUser, LoginPayload } from "@/modules/auth/types";

import { createClient } from "@/supabase/server";
import { isMatricIdentifier } from "@/shared/security/policy";
import { invalidateSessions } from "@/shared/security/revoke-sessions";
import { createAdminClient } from "@/supabase/admin";
import {
  enforceAuthRateLimit,
  enforceRateLimit,
} from "@/shared/security/rate-limit";
import {
  setSessionBoundary,
  validSessionBoundary,
  clearSessionBoundary,
} from "@/shared/security/session";

import type { AuthServiceContract } from "./auth-service.contract";

type ProfileRow = {
  id: string;
  name: string;
  role: AuthUser["role"];
  status: AuthUser["status"];
  avatar_url: string | null;
  matric_number: string | null;
  staff_id: string | null;
  created_at: string;
  session_version: number;
  updated_at: string;
  office_id: string | null;
};

function mapProfileToAuthUser(
  profile: ProfileRow,
  email: string,
  emailVerified: boolean,
): AuthUser {
  return {
    id: profile.id,
    name: profile.name,
    email,
    emailVerified,
    avatarUrl: profile.avatar_url
      ? profile.avatar_url.startsWith("https://")
        ? profile.avatar_url
        : `/api/profile/avatar?v=${encodeURIComponent(profile.updated_at)}`
      : null,
    createdAt: profile.created_at,
    officeId: profile.office_id,
    role: profile.role,
    status: profile.status,
    matricNumber: profile.matric_number,
    staffId: profile.staff_id,
  };
}

export const supabaseAuthService: AuthServiceContract = {
  async login(payload: LoginPayload): Promise<AuthResult<{ user: AuthUser }>> {
    // Fail before password authentication if this deployment cannot create a session.
    sessionSigningKey(process.env.SESSION_SECRET);
    const supabase = await createClient();

    const identifier = payload.identifier.trim();
    await enforceAuthRateLimit("login", identifier);
    let email = identifier;
    if (!identifier.includes("@")) {
      if (!isMatricIdentifier(identifier))
        return { ok: false, error: "Invalid login credentials." };
      // Exact case-insensitive match; do not interpret matric numbers as SQL patterns.
      const admin = createAdminClient();
      const { data: matches, error } = await admin
        .from("profiles")
        .select("id, matric_number")
        .eq("role", "student")
        .eq("status", "active")
        .ilike("matric_number", identifier.replace(/[\\%_]/g, "\\$&"))
        .limit(2);
      if (error || matches?.length !== 1)
        return { ok: false, error: "Invalid login credentials." };
      const account = await admin.auth.admin.getUserById(matches[0]!.id);
      if (!account.data.user?.email)
        return { ok: false, error: "Invalid login credentials." };
      email = account.data.user.email;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: payload.password,
    });

    if (error || !data.user) {
      return {
        ok: false,
        error: "Invalid login credentials.",
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id, name, role, status, avatar_url, matric_number, staff_id, created_at, session_version, updated_at, office_id",
      )
      .eq("id", data.user.id)
      .single();

    if (
      profileError ||
      !profile ||
      !["student", "tutor", "admin", "super_admin"].includes(profile.role)
    ) {
      await supabase.auth.signOut();

      return {
        ok: false,
        error: "User profile not found.",
      };
    }

    if (profile.status !== "active") {
      await supabase.auth.signOut();

      return {
        ok: false,
        error: "This account is not active.",
      };
    }

    if (
      (profile.role === "student" && identifier.includes("@")) ||
      (profile.role !== "student" && !identifier.includes("@"))
    ) {
      await supabase.auth.signOut();
      return {
        ok: false,
        error:
          "Students must use their matric number. Officials must use their email address.",
      };
    }
    await setSessionBoundary(
      data.user.id,
      payload.rememberMe,
      false,
      profile.session_version,
    );

    return {
      ok: true,
      data: {
        user: mapProfileToAuthUser(
          profile,
          data.user.email ?? identifier,
          Boolean(data.user.email_confirmed_at),
        ),
      },
    };
  },

  getCurrentUser: cache(async (): Promise<AuthUser | null> => {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id, name, role, status, avatar_url, matric_number, staff_id, created_at, session_version, updated_at, office_id",
      )
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !profile ||
      !["student", "tutor", "admin", "super_admin"].includes(profile.role)
    ) {
      return null;
    }

    if (
      profile.status !== "active" ||
      !(await validSessionBoundary(user.id, false, profile.session_version))
    ) {
      return null;
    }

    return mapProfileToAuthUser(
      profile,
      user.email ?? "",
      Boolean(user.email_confirmed_at),
    );
  }),

  async register() {
    return {
      ok: false,
      error: "Account registration is not available.",
    };
  },

  async forgotPassword(payload) {
    await enforceAuthRateLimit("password-recovery", payload.email);
    const origin = process.env.NEXT_PUBLIC_SITE_URL;
    if (!origin)
      throw new Error(
        "NEXT_PUBLIC_SITE_URL is required for password recovery.",
      );
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(payload.email, {
      redirectTo: new URL("/auth/callback?next=/reset-password", origin).href,
    });
    if (error && error.status && error.status >= 500)
      throw new Error("Password recovery is temporarily unavailable.");
    // Identical response for missing and existing accounts.
    return { ok: true, data: undefined };
  },

  async resetPassword(payload) {
    await enforceAuthRateLimit("password-reset");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !(await validSessionBoundary(user.id, true))) {
      return {
        ok: false,
        error: "This reset link has expired. Request another reset email.",
      };
    }
    const { error } = await supabase.auth.updateUser({
      password: payload.password,
    });
    if (error)
      return {
        ok: false,
        error: "Unable to reset password. Request a new link and try again.",
      };
    await invalidateSessions(user.id);
    await supabase.auth.signOut({ scope: "global" });
    await clearSessionBoundary();
    return { ok: true, data: undefined };
  },

  async verifyEmail(payload) {
    await enforceAuthRateLimit("verify-email");
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: payload.token,
      type: "email",
    });
    if (error)
      return {
        ok: false,
        error: "This verification link is invalid or expired.",
      };
    return { ok: true, data: undefined };
  },

  async changePassword(userId, payload) {
    const user = await this.getCurrentUser();
    if (!user || user.id !== userId)
      return { ok: false, error: "Please sign in again." };
    await enforceRateLimit("change-password", user.id, 5, 900);
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: payload.currentPassword,
    });
    if (signInError)
      return { ok: false, error: "The current password is incorrect." };
    const { error } = await supabase.auth.updateUser({
      password: payload.newPassword,
    });
    if (error) return { ok: false, error: "Unable to change your password." };
    await supabase.auth.signOut({ scope: "others" });
    const version = await invalidateSessions(user.id);
    await setSessionBoundary(user.id, false, false, version);
    return { ok: true, data: undefined };
  },

  async getUserByEmail(email) {
    const current = await this.getCurrentUser();
    return current?.email.toLowerCase() === email.toLowerCase()
      ? current
      : null;
  },

  async listUsers() {
    const { requireRole } = await import("@/shared/rbac");
    await requireRole(["admin"]);
    const { getUsers } = await import(
      "@/modules/admin/features/users/services/users.service"
    );
    const users = await getUsers();
    return Promise.all(
      users.map(async (user) => {
        const { data, error } =
          await createAdminClient().auth.admin.getUserById(user.id);
        if (error) throw new Error("Unable to read account details.");
        return {
          ...user,
          emailVerified: Boolean(data.user?.email_confirmed_at),
        };
      }),
    );
  },

  async updateUserProfile(userId, input) {
    const { requireRole } = await import("@/shared/rbac");
    await requireRole(["admin"]);
    const { getUsers, updateUser } = await import(
      "@/modules/admin/features/users/services/users.service"
    );
    const current = (await getUsers()).find((user) => user.id === userId);
    if (!current) return { ok: false, error: "User not found." };
    if (input.role && !["student", "tutor"].includes(input.role))
      return { ok: false, error: "Invalid managed role." };
    const merged = {
      ...current,
      ...input,
      role: (input.role ?? current.role) as "student" | "tutor",
    };
    const result = await updateUser(userId, merged);
    if (!result.ok) return result;
    const { data } = await createAdminClient().auth.admin.getUserById(userId);
    return {
      ok: true,
      data: {
        user: {
          ...merged,
          emailVerified: Boolean(data.user?.email_confirmed_at),
        },
      },
    };
  },

  async adminResetPassword(userId) {
    const { requireRole } = await import("@/shared/rbac");
    await requireRole(["admin"]);
    const { resetUserPassword } = await import(
      "@/modules/admin/features/users/services/users.service"
    );
    const result = await resetUserPassword(userId);
    return result.ok
      ? { ok: true, data: { temporaryPassword: result.temporaryPassword } }
      : result;
  },

  async setUserStatus(userId, status) {
    const { requireRole } = await import("@/shared/rbac");
    await requireRole(["admin"]);
    const { setUserStatus } = await import(
      "@/modules/admin/features/users/services/users.service"
    );
    const result = await setUserStatus(userId, status);
    return result.ok ? { ok: true, data: undefined } : result;
  },
};
