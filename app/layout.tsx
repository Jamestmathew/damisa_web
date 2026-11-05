import type { Metadata } from "next";

import { getOptionalSession } from "@/modules/auth/lib/route-guard";
import { SessionProvider } from "@/modules/auth/hooks/session-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SMI Learning Portal",
    template: "%s | SMI Learning Portal",
  },
  description: "Learning, classes, and academic administration",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getOptionalSession();
  const user = session;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider user={user}>{children}</SessionProvider>
      </body>
    </html>
  );
}
