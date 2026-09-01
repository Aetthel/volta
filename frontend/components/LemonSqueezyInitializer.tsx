"use client";

import { useEffect } from "react";

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
 * Client component that initializes Lemon Squeezy on mount.
 * Attaches checkout overlay click handlers to all .lemonsqueezy-button elements.
 */
export default function LemonSqueezyInitializer() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.createLemonSqueezy?.();
    }
  }, []);

  return null;
}
