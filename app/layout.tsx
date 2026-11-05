import { getSessionState } from "@/shared/security/session";
import type { Metadata } from "next";

import { getOptionalSession } from "@/modules/auth/lib/route-guard";
import { SessionProvider } from "@/modules/auth/hooks/session-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SMI Learning Portal",
    template: "%s | SMI Learning Portal",
  },
  description:
    "School of Management and Innovation — learning, classes, and academic administration",
  icons: { icon: "/brand/smi-logo.jpeg", apple: "/brand/smi-logo.jpeg" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getOptionalSession();
  const user = session;
  const sessionState = user ? await getSessionState(user.id) : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider user={user} sessionState={sessionState}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
