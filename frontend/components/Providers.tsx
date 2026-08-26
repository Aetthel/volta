"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import dynamic from "next/dynamic";
import { AlertsProvider } from "@/lib/alerts";
import ThemeInitializer from "@/components/ThemeInitializer";
import TopProgressBar from "@/components/TopProgressBar";
import SecurityGuard from "@/components/SecurityGuard";

const WelcomeModal = dynamic(() => import("@/components/WelcomeModal"), {
  ssr: false,
});

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
        <SecurityGuard />
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        <WelcomeModal />
        {children}
      </AlertsProvider>
    </SessionProvider>
  );
}
