"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
    LemonSqueezy?: {
      Url?: {
        Open: (url: string) => void;
        Close: () => void;
      };
      Setup?: (options: {
        eventHandler: (event: { event: string; data?: any }) => void;
      }) => void;
    };
  }
}

/**
 * Client component that initializes Lemon Squeezy on mount and whenever the route changes.
 * Attaches checkout overlay click handlers to all .lemonsqueezy-button elements.
 */
export default function LemonSqueezyInitializer() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.createLemonSqueezy?.();
    }
  }, [pathname]);

  return null;
}
