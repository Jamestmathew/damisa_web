/**
 * Auth Module — Constants
 */

export const AUTH_ROUTES = {
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  changePassword: "/settings/change-password",
  afterLogout: "/login",
} as const;

export const AUTH_COOKIE_NAME = "app_session";

export const REMEMBER_ME_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const DEFAULT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours

export const PASSWORD_MIN_LENGTH = 8;

export const AUTH_ERROR_MESSAGES = {
  invalidCredentials: "Incorrect email or password.",
  accountNotActive: "Your account is not active. Please contact your administrator.",
  emailInUse: "An account with this email already exists.",
  genericError: "Something went wrong. Please try again.",
  tokenExpired: "This link has expired. Please request a new one.",
  tokenInvalid: "This link is invalid or has already been used.",
  sessionExpired: "Your session has expired. Please sign in again.",
  unauthorized: "You need to be signed in to view this page.",
} as const;

export const AUTH_SUCCESS_MESSAGES = {
  registered: "Account created! Check your inbox to verify your email.",
  passwordResetEmailSent: "If an account exists for that email, a reset link has been sent.",
  passwordReset: "Your password has been reset. You can now sign in.",
  emailVerified: "Your email has been verified.",
  passwordChanged: "Your password has been updated.",
} as const;
