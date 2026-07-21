"use client";

import { SessionProvider } from "next-auth/react";
import { AlertsProvider } from "@/lib/alerts";
import ThemeInitializer from "@/components/ThemeInitializer";

export default function Providers({
  session,
  children,
}: {
  session: any;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider session={session}>
      <AlertsProvider>
        <ThemeInitializer />
        {children}
      </AlertsProvider>
    </SessionProvider>
  );
}
