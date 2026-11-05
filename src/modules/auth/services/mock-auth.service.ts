import "server-only";

import { AUTH_ERROR_MESSAGES } from "@/modules/auth/constants";
import type {
  AuthUser,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
} from "@/modules/auth/types";

import type { AuthServiceContract } from "./auth-service.contract";

/**
 * In-memory mock backend for local development / demos.
 *
 * This implementation remains temporarily available while the
 * application is being migrated to Supabase Auth.
 *
 * The active application implementation is now:
 *
 *     supabaseAuthService
 *
 * See `services/index.ts`.
 *
 * There is no public self-registration:
 * `register()` is only used by account-provisioning flows.
 */
interface MockUserRecord {
  user: AuthUser;
  password: string;
  verificationToken: string | null;
  resetToken: string | null;
}

const db = new Map<string, MockUserRecord>();
const matricIndex = new Map<string, string>();

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId() {
  return `usr_${Math.random().toString(36).slice(2, 11)}`;
}

function generateToken() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function generateTemporaryPassword() {
  return `Temp-${Math.random().toString(36).slice(2, 8)}`;
}

function resolveRecordByIdentifier(
  identifier: string,
): MockUserRecord | undefined {
  const key = identifier.toLowerCase();

  if (db.has(key)) {
    return db.get(key);
  }

  const emailKey = matricIndex.get(key);

  return emailKey ? db.get(emailKey) : undefined;
}

export const mockAuthService: AuthServiceContract = {
  async login({ identifier, password }: LoginPayload) {
    await delay();

    const record = resolveRecordByIdentifier(identifier);

    if (!record || record.password !== password) {
      return {
        ok: false,
        error: AUTH_ERROR_MESSAGES.invalidCredentials,
      };
    }

    if (record.user.status !== "active") {
      return {
        ok: false,
        error: AUTH_ERROR_MESSAGES.accountNotActive,
      };
    }

    return {
      ok: true,
      data: {
        user: record.user,
        token: generateToken(),
      },
    };
  },

  async register({
    name,
    email,
    password,
    role = "student",
    status = "active",
    matricNumber,
    staffId,
  }: RegisterPayload) {
    await delay();

    const key = email.toLowerCase();

    if (db.has(key)) {
      return {
        ok: false,
        error: AUTH_ERROR_MESSAGES.emailInUse,
        fieldErrors: {
          email: AUTH_ERROR_MESSAGES.emailInUse,
        },
      };
    }

    if (matricNumber && matricIndex.has(matricNumber.toLowerCase())) {
      return {
        ok: false,
        error: "This matric number is already in use.",
        fieldErrors: {
          matricNumber: "This matric number is already in use.",
        },
      };
    }

    const user: AuthUser = {
      id: generateId(),
      name,
      email,
      emailVerified: false,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      role,
      status,
      matricNumber: matricNumber ?? null,
      staffId: staffId ?? null,
    };

    db.set(key, {
      user,
      password,
      verificationToken: generateToken(),
      resetToken: null,
    });

    if (matricNumber) {
      matricIndex.set(matricNumber.toLowerCase(), key);
    }

    return {
      ok: true,
      data: {
        user,
      },
    };
  },

  async forgotPassword({ email }: ForgotPasswordPayload) {
    await delay();

    const record = db.get(email.toLowerCase());

    // Always respond successfully so we do not reveal
    // whether an email exists.
    if (record) {
      record.resetToken = generateToken();
    }

    return {
      ok: true,
      data: undefined,
    };
  },

  async resetPassword({ token, password }: ResetPasswordPayload) {
    await delay();

    const record = [...db.values()].find((item) => item.resetToken === token);

    if (!record) {
      return {
        ok: false,
        error: AUTH_ERROR_MESSAGES.tokenInvalid,
      };
    }

    record.password = password;
    record.resetToken = null;

    return {
      ok: true,
      data: undefined,
    };
  },

  async verifyEmail({ token }: VerifyEmailPayload) {
    await delay();

    const record = [...db.values()].find(
      (item) => item.verificationToken === token,
    );

    if (!record) {
      return {
        ok: false,
        error: AUTH_ERROR_MESSAGES.tokenInvalid,
      };
    }

    record.user.emailVerified = true;
    record.verificationToken = null;

    return {
      ok: true,
      data: undefined,
    };
  },

  async changePassword(
    userId: string,
    { currentPassword, newPassword }: ChangePasswordPayload,
  ) {
    await delay();

    const record = [...db.values()].find((item) => item.user.id === userId);

    if (!record || record.password !== currentPassword) {
      return {
        ok: false,
        error: "Current password is incorrect",
        fieldErrors: {
          currentPassword: "Current password is incorrect",
        },
      };
    }

    record.password = newPassword;

    return {
      ok: true,
      data: undefined,
    };
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    /*
     * The mock service has no persistent browser session.
     *
     * This method only exists to satisfy the shared auth contract
     * while the application is being migrated to Supabase Auth.
     */
    return null;
  },

  async getUserByEmail(email: string) {
    const record = db.get(email.toLowerCase());

    return record?.user ?? null;
  },

  async listUsers() {
    await delay();

    return [...db.values()].map((record) => record.user);
  },

  async updateUserProfile(userId, input) {
    await delay();

    const oldKey = [...db.entries()].find(
      ([, record]) => record.user.id === userId,
    )?.[0];

    const record = oldKey ? db.get(oldKey) : undefined;

    if (!record || !oldKey) {
      return {
        ok: false,
        error: "User not found.",
      };
    }

    const nextEmail = input.email?.toLowerCase() ?? oldKey;

    if (nextEmail !== oldKey && db.has(nextEmail)) {
      return {
        ok: false,
        error: "A user with this email already exists.",
        fieldErrors: {
          email: "A user with this email already exists.",
        },
      };
    }

    if (input.matricNumber) {
      const existingMatricOwner = matricIndex.get(
        input.matricNumber.toLowerCase(),
      );

      if (existingMatricOwner && existingMatricOwner !== oldKey) {
        return {
          ok: false,
          error: "This matric number is already in use.",
          fieldErrors: {
            matricNumber: "This matric number is already in use.",
          },
        };
      }
    }

    if (input.name !== undefined) {
      record.user.name = input.name;
    }

    if (input.role !== undefined) {
      record.user.role = input.role;
    }

    if (input.email !== undefined) {
      record.user.email = input.email;
    }

    if (input.matricNumber !== undefined) {
      record.user.matricNumber = input.matricNumber;
    }

    if (input.staffId !== undefined) {
      record.user.staffId = input.staffId;
    }

    if (nextEmail !== oldKey) {
      db.delete(oldKey);
      db.set(nextEmail, record);
    }

    if (record.user.matricNumber) {
      // Remove any stale index entry pointing to the
      // previous email key, then create the new index.
      for (const [matric, email] of matricIndex.entries()) {
        if (email === oldKey) {
          matricIndex.delete(matric);
        }
      }

      matricIndex.set(record.user.matricNumber.toLowerCase(), nextEmail);
    }

    return {
      ok: true,
      data: {
        user: record.user,
      },
    };
  },

  async adminResetPassword(userId: string) {
    await delay();

    const record = [...db.values()].find((item) => item.user.id === userId);

    if (!record) {
      return {
        ok: false,
        error: "User not found.",
      };
    }

    const temporaryPassword = generateTemporaryPassword();

    record.password = temporaryPassword;

    return {
      ok: true,
      data: {
        temporaryPassword,
      },
    };
  },

  async setUserStatus(userId: string, status: AuthUser["status"]) {
    await delay();

    const record = [...db.values()].find((item) => item.user.id === userId);

    if (!record) {
      return {
        ok: false,
        error: "User not found.",
      };
    }

    record.user.status = status;

    return {
      ok: true,
      data: undefined,
    };
  },
};

/**
 * Seed accounts so each role can sign in during
 * mock/local development.
 */
void mockAuthService.register({
  name: "Ngozi Adeyemi",
  email: "demo@example.com",
  password: "Password1",
  confirmPassword: "Password1",
  acceptTerms: true,
  role: "admin",
  status: "active",
  staffId: "ADM-0001",
});

void mockAuthService.register({
  name: "Chidinma Okoro",
  email: "c.okoro@student.school.edu",
  password: "Password1",
  confirmPassword: "Password1",
  acceptTerms: true,
  role: "student",
  status: "active",
  matricNumber: "CSC/2023/001",
});

void mockAuthService.register({
  name: "Dr. A. Bello",
  email: "a.bello@school.edu",
  password: "Password1",
  confirmPassword: "Password1",
  acceptTerms: true,
  role: "tutor",
  status: "active",
  staffId: "STF-0001",
});

void mockAuthService.register({
  name: "Founder Okonkwo",
  email: "superadmin@example.com",
  password: "Password1",
  confirmPassword: "Password1",
  acceptTerms: true,
  role: "super_admin",
  status: "active",
  staffId: "SA-0001",
});
