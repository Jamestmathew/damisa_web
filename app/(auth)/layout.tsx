import { requireGuest } from "@/modules/auth/lib/route-guard";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireGuest();

  return (
    <div className="auth-backdrop flex min-h-screen items-center justify-center p-4">
      {children}
    </div>
  );
}
