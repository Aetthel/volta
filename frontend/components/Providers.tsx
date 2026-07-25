"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { AlertsProvider } from "@/lib/alerts";
import ThemeInitializer from "@/components/ThemeInitializer";
import TopProgressBar from "@/components/TopProgressBar";

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
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        {children}
      </AlertsProvider>
    </SessionProvider>
  );
}
