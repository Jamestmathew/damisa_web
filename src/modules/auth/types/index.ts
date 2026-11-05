/**
 * Auth Module — Type System
 *
 * Self-contained. No imports from Student/Admin/Tutor or any other
 * business module.
 *
 * Exception:
 * Role and AccountStatus come from the central RBAC module because
 * authentication is responsible for enforcing role and account status.
 */

import type { AccountStatus, Role } from "@/shared/rbac";

export type AuthProvider = "google" | "github" | "microsoft";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  avatarUrl?: string | null;
  createdAt: string;
  officeId?: string | null;

  role: Role;
  status: AccountStatus;

  /**
   * Students sign in with their matric number instead of email.
   * This value is unique and must not be editable by the student.
   */
  matricNumber?: string | null;

  /**
   * Tutors and Admins may have a staff identifier.
   */
  staffId?: string | null;
}

export interface AuthSession {
  user: AuthUser;

  /**
   * Unix timestamp in milliseconds representing when
   * the authenticated session expires.
   */
  expiresAt: number;
}

/**
 * Discriminated-union result returned by auth services
 * and server actions.
 */
export type AuthResult<TData = undefined> =
  | {
      ok: true;
      data: TData;
      message?: string;
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<string, string>>;
    };

export type AuthActionState<TData = undefined> = AuthResult<TData> | null;

export interface LoginPayload {
  /**
   * Tutors, Admins and Super Admins:
   * sign in with email.
   *
   * Students:
   * sign in with matric number.
   *
   * The server resolves the identifier.
   */
  identifier: string;

  password: string;

  rememberMe?: boolean;
}

/**
 * Account provisioning payload.
 *
 * There is no public self-registration flow in the intended
 * architecture. Account creation is performed by an authorized
 * administrator through the provisioning flow.
 */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;

  role?: Role;
  status?: AccountStatus;

  matricNumber?: string | null;
  staffId?: string | null;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
