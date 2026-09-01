"use client";

import Providers from "@/components/Providers";
import type { ThemePreferences } from "@/lib/theme";

export default function ClientProvidersWrapper({
  session,
  initialPreferences,
  children,
}: {
  session: any;
  initialPreferences?: ThemePreferences;
  children: React.ReactNode;
}) {
  return (
    <Providers session={session} initialPreferences={initialPreferences}>
      {children}
    </Providers>
  );
}

