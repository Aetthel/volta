"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import dynamic from "next/dynamic";
import { AlertsProvider } from "@/lib/alerts";
import { ThemeProvider } from "@/context/ThemeContext";
import type { ThemePreferences } from "@/lib/theme";
import TopProgressBar from "@/components/TopProgressBar";
import SecurityGuard from "@/components/SecurityGuard";

import WelcomeModal from "@/components/WelcomeModal";
import LemonSqueezyInitializer from "@/components/LemonSqueezyInitializer";
import { Toaster } from "@/components/ui/volta-ui";

export default function Providers({
  session,
  initialPreferences,
  children,
}: {
  session: any;
  initialPreferences?: ThemePreferences;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider basePath="/api/auth" session={session}>
      <ThemeProvider initialPreferences={initialPreferences}>
        <AlertsProvider>
          <SecurityGuard />
          <LemonSqueezyInitializer />
          <Suspense fallback={null}>
            <TopProgressBar />
          </Suspense>
          <WelcomeModal />
          <Toaster />
          {children}
        </AlertsProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

