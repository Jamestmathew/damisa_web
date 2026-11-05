import type {
  AuthResult,
  AuthUser,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
} from "@/modules/auth/types";

export interface AuthServiceContract {
  login(payload: LoginPayload): Promise<AuthResult<{ user: AuthUser }>>;

  register(payload: RegisterPayload): Promise<AuthResult<{ user: AuthUser }>>;

  forgotPassword(payload: ForgotPasswordPayload): Promise<AuthResult>;

  resetPassword(payload: ResetPasswordPayload): Promise<AuthResult>;

  verifyEmail(payload: VerifyEmailPayload): Promise<AuthResult>;

  changePassword(
    userId: string,
    payload: ChangePasswordPayload,
  ): Promise<AuthResult>;

  /**
   * Resolve the currently authenticated Supabase user
   * and their application profile.
   */
  getCurrentUser(): Promise<AuthUser | null>;

  getUserByEmail(email: string): Promise<AuthUser | null>;

  listUsers(): Promise<AuthUser[]>;

  updateUserProfile(
    userId: string,
    input: Partial<
      Pick<AuthUser, "name" | "email" | "role" | "matricNumber" | "staffId">
    >,
  ): Promise<AuthResult<{ user: AuthUser }>>;

  adminResetPassword(
    userId: string,
  ): Promise<AuthResult<{ temporaryPassword: string }>>;

  setUserStatus(
    userId: string,
    status: AuthUser["status"],
  ): Promise<AuthResult>;
}
