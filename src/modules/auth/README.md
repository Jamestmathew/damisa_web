# Authentication Module

Self-contained auth module. Nothing in `src/modules/auth` imports from any
other business module (Students, Courses, Admin, etc.), and nothing outside
it should reach past `src/modules/auth/index.ts` (client API) or
`src/modules/auth/lib` / `src/modules/auth/actions` (server-only APIs).

## Try it

```
npm install
cp .env.example .env.local   # fill in AUTH_SECRET (openssl rand -base64 32)
npm run dev
```

Demo login: `demo@example.com` / `Password1` (seeded in the mock service).

## Folder structure

```
src/modules/auth/
├── types/            Domain types + AuthResult<T> discriminated union
├── constants/         Routes, cookie name, timings, copy for errors/success
├── validation/        Zod schemas (one per flow), reused by client + server
├── services/           Backend-agnostic contract + mock implementation
│                        (swap `authService` in services/index.ts for a real
│                        backend later — nothing else changes)
├── actions/            "use server" actions: login, register, forgot/reset
│                        password, verify email, change password, logout
├── lib/                Server-only session cookie (jose-signed JWT) +
│                        route guards: requireAuth / requireGuest
├── hooks/               usePasswordVisibility, SessionProvider/useSession
├── components/
│   ├── ui/              AuthCard, AuthHeader, AuthFooter, PasswordInput,
│   │                    LoadingButton, SocialLoginButton, AuthDivider,
│   │                    FormStatusMessage
│   └── forms/           LoginForm, RegisterForm, ForgotPasswordForm,
│                        ResetPasswordForm, VerifyEmailStatus,
│                        ChangePasswordForm
└── index.ts             Public barrel (client-safe exports only)

app/
├── (auth)/               Guest-only layout + /login /register
│                        /forgot-password /reset-password /verify-email
└── (protected)/          Auth-required layout + /dashboard
                         /settings/change-password
middleware.ts             Edge-level redirect guard (defense in depth,
                          alongside the server-component guards)
```

## Swapping the mock backend

`src/modules/auth/services/mock-auth.service.ts` is in-memory and resets
on server restart. To connect a real backend:

1. Implement `AuthServiceContract` (`services/auth-service.contract.ts`)
   against your API/DB.
2. Point `authService` in `services/index.ts` at the new implementation.

No action, form, or page needs to change.

## Route protection

- Server components/layouts: `await requireAuth()` / `await requireGuest()`
  from `@/modules/auth/lib/route-guard`.
- Edge/middleware: `middleware.ts` checks the signed cookie before the
  request reaches a page, so protected pages never even render for a
  logged-out visitor.
